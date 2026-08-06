<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Order;
use App\Models\SiteSetting;
use App\Models\Wallet;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EscrowService
{
    /**
     * Centralized commission calculation — SINGLE source of truth.
     * The rate is fetched from site_settings (configurable from back-office).
     */
    public static function calculateCommission(float $amount): array
    {
        $taux = SiteSetting::getCommissionRate();
        $commission = round($amount * $taux / 100, 2);

        return [
            'taux' => $taux,
            'montant' => $commission,
            'net_vendeur' => round($amount - $commission, 2),
        ];
    }

    /**
     * Step 1: Buyer pays → funds held in platform escrow wallet.
     */
    public static function capturePayment(Order $order): Order
    {
        return DB::transaction(function () use ($order) {
            $order->update([
                'statut' => 'sequestre',
            ]);

            // Credit platform escrow wallet (held funds)
            $platformWallet = Wallet::firstOrCreate(
                ['user_id' => config('app.platform_admin_user_id', 1)],
                ['solde' => 0, 'solde_disponible' => 0, 'solde_en_attente' => 0]
            );

            $platformWallet->increment('solde_en_attente', $order->total);

            $platformWallet->transactions()->create([
                'order_id' => $order->id,
                'type' => 'depot',
                'montant' => $order->total,
                'description' => "Paiement reçu pour la commande #{$order->numero_commande}",
                'statut' => 'complete',
            ]);

            Log::info("Escrow: Payment captured for order {$order->numero_commande}", [
                'order_id' => $order->id,
                'montant' => $order->total,
            ]);

            return $order->fresh();
        });
    }

    /**
     * Step 2: Seller ships → tracks shipment.
     */
    public static function markShipped(Order $order, string $trackingNumber, string $transporteur = ''): Order
    {
        $confirmationDelay = SiteSetting::get('duree_confirmation_jours_ouvrables', 10);
        $dateConfirmationLimite = now()->addWeekdays($confirmationDelay);

        return DB::transaction(function () use ($order, $trackingNumber, $transporteur, $dateConfirmationLimite) {
            $order->update([
                'statut' => 'expedie',
                'tracking_number' => $trackingNumber,
                'transporteur' => $transporteur,
                'date_expedition' => now(),
                'date_confirmation_limite' => $dateConfirmationLimite,
            ]);

            Log::info("Escrow: Order {$order->numero_commande} shipped", [
                'tracking' => $trackingNumber,
                'confirmation_deadline' => $dateConfirmationLimite->toIso8601String(),
            ]);

            return $order->fresh();
        });
    }

    /**
     * Step 3a: Buyer confirms → release to seller minus commission.
     */
    public static function confirmReception(Order $order): Order
    {
        return DB::transaction(function () use ($order) {
            $commission = static::calculateCommission($order->prix);

            // Debit escrow
            $platformWallet = Wallet::where('user_id', config('app.platform_admin_user_id', 1))->first();
            $platformWallet->decrement('solde_en_attente', $order->total);

            // Credit commission to platform
            $platformWallet->credit(
                $commission['montant'],
                'commission',
                $order->id,
                "Commission ({$commission['taux']}%) sur la commande #{$order->numero_commande}"
            );

            // Credit seller (net amount)
            $sellerWallet = Wallet::firstOrCreate(
                ['user_id' => $order->seller_id],
                ['solde' => 0, 'solde_disponible' => 0, 'solde_en_attente' => 0]
            );

            $sellerWallet->credit(
                $commission['net_vendeur'],
                'encaissement',
                $order->id,
                "Encaissement net pour la commande #{$order->numero_commande}"
            );

            $order->update([
                'statut' => 'vire_vendeur',
                'date_confirmation' => now(),
                'date_virement' => now(),
                'commission_montant' => $commission['montant'],
                'commission_taux' => $commission['taux'],
            ]);

            // Generate invoices
            static::generateInvoices($order, $commission);

            Log::info("Escrow: Order {$order->numero_commande} confirmed, seller paid", [
                'commission' => $commission['montant'],
                'net_vendeur' => $commission['net_vendeur'],
            ]);

            return $order->fresh();
        });
    }

    /**
     * Step 3b: No confirmation / dispute resolved for buyer → refund.
     */
    public static function refundBuyer(Order $order): Order
    {
        return DB::transaction(function () use ($order) {
            $platformWallet = Wallet::where('user_id', config('app.platform_admin_user_id', 1))->first();
            $platformWallet->decrement('solde_en_attente', $order->total);

            // Refund buyer
            $buyerWallet = Wallet::firstOrCreate(
                ['user_id' => $order->buyer_id],
                ['solde' => 0, 'solde_disponible' => 0, 'solde_en_attente' => 0]
            );

            $buyerWallet->credit(
                $order->total,
                'remboursement',
                $order->id,
                "Remboursement pour la commande #{$order->numero_commande}"
            );

            $order->update([
                'statut' => 'rembourse',
            ]);

            Log::info("Escrow: Order {$order->numero_commande} refunded to buyer", [
                'montant' => $order->total,
            ]);

            return $order->fresh();
        });
    }

    /**
     * Generate invoices for buyer, seller, and platform.
     */
    protected static function generateInvoices(Order $order, array $commission): void
    {
        // Buyer invoice
        Invoice::create([
            'numero_facture' => (new Invoice)->generateNumeroFacture(),
            'order_id' => $order->id,
            'user_id' => $order->buyer_id,
            'type' => 'acheteur',
            'sous_total' => $order->prix,
            'commission' => 0,
            'total' => $order->total,
        ]);

        // Seller invoice
        Invoice::create([
            'numero_facture' => (new Invoice)->generateNumeroFacture(),
            'order_id' => $order->id,
            'user_id' => $order->seller_id,
            'type' => 'vendeur',
            'sous_total' => $order->prix,
            'commission' => $commission['montant'],
            'total' => $commission['net_vendeur'],
        ]);

        // Platform invoice
        Invoice::create([
            'numero_facture' => (new Invoice)->generateNumeroFacture(),
            'order_id' => $order->id,
            'user_id' => config('app.platform_admin_user_id', 1),
            'type' => 'plateforme',
            'sous_total' => $order->prix,
            'commission' => $commission['montant'],
            'total' => $commission['montant'],
        ]);
    }
}
