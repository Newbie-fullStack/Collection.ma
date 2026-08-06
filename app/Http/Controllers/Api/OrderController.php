<?php

namespace App\Http\Controllers\Api;

use App\Events\OrderShipped;
use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Listing;
use App\Models\Order;
use App\Models\Notification;
use App\Models\Wallet;
use App\Services\EscrowService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $orders = Order::where('buyer_id', $request->user()->id)
            ->with([
                'listing:numero_auto,titre',
                'seller:pseudo',
            ])
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($orders);
    }

    public function sellerOrders(Request $request): JsonResponse
    {
        $orders = Order::where('seller_id', $request->user()->id)
            ->with([
                'listing:numero_auto,titre',
                'buyer:pseudo',
            ])
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($orders);
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        $user = $request->user();
        if ($order->buyer_id !== $user->id && $order->seller_id !== $user->id && ! $user->isAdmin()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        return response()->json($order->load([
            'listing',
            'buyer:pseudo,nom,prenom',
            'seller:pseudo,nom,prenom',
            'invoices',
        ]));
    }

    public function ship(Request $request, Order $order): JsonResponse
    {
        if ($order->seller_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        if ($order->statut !== 'sequestre') {
            return response()->json(['message' => 'Commande non éligible à l\'expédition'], 422);
        }

        $validated = $request->validate([
            'tracking_number' => 'required|string|max:100',
            'transporteur' => 'nullable|string|max:100',
        ]);

        $order = EscrowService::markShipped(
            $order,
            $validated['tracking_number'],
            $validated['transporteur'] ?? ''
        );

        // Dispatch real-time event
        OrderShipped::dispatch($order);

        // Create notification for buyer
        Notification::create([
            'user_id' => $order->buyer_id,
            'type' => 'order_shipped',
            'title' => 'Commande expédiée',
            'title_ar' => 'تم شحن الطلب',
            'message' => "Votre commande #{$order->numero_commande} a été expédiée. Suivi: {$validated['tracking_number']}",
            'message_ar' => "تم شحن طلبك رقم #{$order->numero_commande}. التتبع: {$validated['tracking_number']}",
            'link' => "/acheteur/commandes",
            'data' => [
                'order_id' => $order->id,
                'tracking_number' => $validated['tracking_number'],
            ],
        ]);

        return response()->json($order);
    }

    public function confirmReception(Request $request, Order $order): JsonResponse
    {
        if ($order->buyer_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        if ($order->statut !== 'expedie') {
            return response()->json(['message' => 'Commande non éligible à la confirmation'], 422);
        }

        $order = EscrowService::confirmReception($order);

        // Create notification for seller
        Notification::create([
            'user_id' => $order->seller_id,
            'type' => 'order_delivered',
            'title' => 'Commande confirmée',
            'title_ar' => 'تم تأكيد الاستلام',
            'message' => "La commande #{$order->numero_commande} a été confirmée. Le paiement vous a été viré.",
            'message_ar' => "تم تأكيد استلام الطلب #{$order->numero_commande}. تم تحويل المبلغ لك.",
            'link' => "/vendeur/ventes",
            'data' => [
                'order_id' => $order->id,
            ],
        ]);

        return response()->json($order);
    }

    public function recentSales(Request $request): JsonResponse
    {
        $orders = Order::where('seller_id', $request->user()->id)
            ->with('listing:numero_auto,titre')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        return response()->json($orders);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'listing_id' => 'required|exists:listings,id',
        ]);

        $listing = Listing::findOrFail($validated['listing_id']);
        $user = $request->user();

        if ($listing->seller_id === $user->id) {
            return response()->json(['message' => 'Vous ne pouvez pas acheter votre propre annonce'], 422);
        }

        if ($listing->statut !== 'active') {
            return response()->json(['message' => 'Cette annonce n\'est plus disponible'], 422);
        }

        $existing = Order::where('buyer_id', $user->id)
            ->where('listing_id', $listing->id)
            ->whereIn('statut', ['attente_paiement', 'sequestre', 'expedie'])
            ->exists();

        if ($existing) {
            return response()->json(['message' => 'Vous avez déjà une commande en cours pour cette annonce'], 422);
        }

        // Check buyer wallet balance
        $buyerWallet = Wallet::where('user_id', $user->id)->first();
        $total = $listing->prix_vente + $listing->frais_port;

        if (! $buyerWallet || $buyerWallet->solde_disponible < $total) {
            $solde = $buyerWallet->solde_disponible ?? 0;
            return response()->json([
                'message' => 'Solde insuffisant',
                'insufficient_funds' => true,
                'solde' => $solde,
                'total' => $total,
                'manque' => round($total - $solde, 2),
            ], 422);
        }

        $commission = EscrowService::calculateCommission($listing->prix_vente);

        $order = Order::create([
            'numero_commande' => 'CMD-' . strtoupper(uniqid()),
            'listing_id' => $listing->id,
            'buyer_id' => $user->id,
            'seller_id' => $listing->seller_id,
            'prix' => $listing->prix_vente,
            'frais_port' => $listing->frais_port,
            'commission_montant' => $commission['montant'],
            'commission_taux' => $commission['taux'],
            'total' => $total,
            'statut' => 'attente_paiement',
        ]);

        // Capture payment from buyer wallet
        $buyerWallet->debit($total, 'paiement', $order->id, "Paiement pour la commande #{$order->numero_commande}");
        $order = EscrowService::capturePayment($order);

        return response()->json($order->load('listing'), 201);
    }

    public function sellerInvoices(Request $request): JsonResponse
    {
        $invoices = Invoice::where('user_id', $request->user()->id)
            ->with('order:numero_commande')
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($invoices);
    }

    public function sellerStats(Request $request): JsonResponse
    {
        $user = $request->user();

        $totalVentes = Order::where('seller_id', $user->id)
            ->where('statut', 'vire_vendeur')
            ->count();

        $chiffreAffaires = Order::where('seller_id', $user->id)
            ->where('statut', 'vire_vendeur')
            ->sum('prix');

        $commissionTotale = Order::where('seller_id', $user->id)
            ->where('statut', 'vire_vendeur')
            ->sum('commission_montant');

        $annoncesActives = Listing::where('seller_id', $user->id)
            ->where('statut', 'active')
            ->count();

        $vuesTotales = Listing::where('seller_id', $user->id)
            ->sum('nb_vues');

        $topAnnonces = Listing::where('seller_id', $user->id)
            ->orderByDesc('nb_vues')
            ->limit(5)
            ->get(['id', 'titre', 'nb_vues', 'prix_vente']);

        return response()->json([
            'total_ventes' => $totalVentes,
            'chiffre_affaires' => round($chiffreAffaires, 2),
            'commission_totale' => round($commissionTotale, 2),
            'annonces_actives' => $annoncesActives,
            'vues_totales' => $vuesTotales,
            'top_annonces' => $topAnnonces,
        ]);
    }
}
