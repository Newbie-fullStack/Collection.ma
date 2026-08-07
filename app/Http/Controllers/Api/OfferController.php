<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use App\Models\Offer;
use App\Models\Order;
use App\Models\Wallet;
use App\Services\EscrowService;
use App\Services\NotificationsService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OfferController extends Controller
{
    /**
     * Buyer proposes a price on an achat_immediat listing.
     */
    public function store(Request $request, Listing $listing): JsonResponse
    {
        $user = $request->user();

        if ($listing->seller_id === $user->id) {
            return response()->json(['message' => 'Vous ne pouvez pas faire une offre sur votre propre annonce'], 422);
        }

        if ($listing->statut !== 'active') {
            return response()->json(['message' => 'Cette annonce n\'est plus disponible'], 422);
        }

        $validated = $request->validate([
            'montant' => 'required|numeric|min:1',
            'message' => 'nullable|string|max:500',
        ]);

        if ($validated['montant'] > $listing->prix_vente) {
            return response()->json([
                'message' => 'Votre offre ne peut pas dépasser le prix affiché',
            ], 422);
        }

        // Prevent duplicate pending offers on the same listing
        $existing = Offer::where('listing_id', $listing->id)
            ->where('buyer_id', $user->id)
            ->where('statut', Offer::STATUT_EN_ATTENTE)
            ->exists();

        if ($existing) {
            return response()->json(['message' => 'Vous avez déjà une offre en attente sur cette annonce'], 422);
        }

        $offer = Offer::create([
            'listing_id' => $listing->id,
            'buyer_id' => $user->id,
            'seller_id' => $listing->seller_id,
            'montant' => $validated['montant'],
            'message' => $validated['message'] ?? null,
            'statut' => Offer::STATUT_EN_ATTENTE,
        ]);

        NotificationsService::notify(
            $listing->seller_id,
            'offer_received',
            'Nouvelle offre',
            'عرض جديد',
            "{$user->pseudo} propose {$validated['montant']} DH pour \"{$listing->titre}\"",
            "{$user->pseudo} يعرض {$validated['montant']} درهم على \"{$listing->titre}\"",
            '/vendeur/offres',
            ['offer_id' => $offer->id, 'listing_id' => $listing->id]
        );

        return response()->json($offer->load('listing:numero_auto,titre'), 201);
    }

    /**
     * Buyer's own offers.
     */
    public function myOffers(Request $request): JsonResponse
    {
        $offers = Offer::where('buyer_id', $request->user()->id)
            ->with(['listing:numero_auto,titre,prix_vente,statut,mode', 'seller:pseudo'])
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($offers);
    }

    /**
     * Offers received on the seller's listings.
     */
    public function sellerOffers(Request $request): JsonResponse
    {
        $offers = Offer::where('seller_id', $request->user()->id)
            ->with(['listing:numero_auto,titre,prix_vente,mode', 'buyer:pseudo'])
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($offers);
    }

    /**
     * Seller accepts the offer → creates an order at the offered price.
     */
    public function accept(Request $request, Offer $offer): JsonResponse
    {
        if ($offer->seller_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        if ($offer->statut !== Offer::STATUT_EN_ATTENTE) {
            return response()->json(['message' => 'Cette offre n\'est plus en attente'], 422);
        }

        $listing = $offer->listing;
        if ($listing->statut !== 'active') {
            return response()->json(['message' => 'L\'annonce n\'est plus disponible'], 422);
        }

        // Buyer wallet must cover offered amount + shipping
        $buyerWallet = Wallet::where('user_id', $offer->buyer_id)->first();
        $total = $offer->montant + $listing->frais_port;

        if (! $buyerWallet || $buyerWallet->solde_disponible < $total) {
            return response()->json([
                'message' => 'Solde insuffisant côté acheteur',
                'insufficient_funds' => true,
                'total' => $total,
            ], 422);
        }

        $commission = EscrowService::calculateCommission($offer->montant);

        $order = Order::create([
            'numero_commande' => (new Order)->generateNumeroCommande(),
            'listing_id' => $listing->id,
            'buyer_id' => $offer->buyer_id,
            'seller_id' => $offer->seller_id,
            'prix' => $offer->montant,
            'frais_port' => $listing->frais_port,
            'commission_montant' => $commission['montant'],
            'commission_taux' => $commission['taux'],
            'total' => $total,
            'statut' => 'attente_paiement',
        ]);

        $buyerWallet->debit($total, 'paiement', $order->id, "Paiement pour la commande #{$order->numero_commande}");
        $order = EscrowService::capturePayment($order);
        $listing->update(['statut' => 'vendue']);

        $offer->update([
            'statut' => Offer::STATUT_ACCEPTEE,
            'date_traitement' => now(),
        ]);

        NotificationsService::notify(
            $offer->buyer_id,
            'offer_accepted',
            'Offre acceptée',
            'تم قبول عرضك',
            "Votre offre de {$offer->montant} DH pour \"{$listing->titre}\" a été acceptée.",
            "تم قبول عرضك البالغ {$offer->montant} درهم على \"{$listing->titre}\".",
            '/acheteur/commandes',
            ['offer_id' => $offer->id, 'order_id' => $order->id]
        );

        return response()->json($order->load(['listing', 'seller:pseudo']), 200);
    }

    /**
     * Seller rejects the offer (with optional reason).
     */
    public function reject(Request $request, Offer $offer): JsonResponse
    {
        if ($offer->seller_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        if ($offer->statut !== Offer::STATUT_EN_ATTENTE) {
            return response()->json(['message' => 'Cette offre n\'est plus en attente'], 422);
        }

        $offer->update([
            'statut' => Offer::STATUT_REFUSEE,
            'date_traitement' => now(),
        ]);

        NotificationsService::notify(
            $offer->buyer_id,
            'offer_rejected',
            'Offre refusée',
            'تم رفض عرضك',
            "Votre offre de {$offer->montant} DH pour \"{$offer->listing->titre}\" a été refusée.",
            "تم رفض عرضك البالغ {$offer->montant} درهم على \"{$offer->listing->titre}\".",
            '/acheteur/offres',
            ['offer_id' => $offer->id]
        );

        return response()->json(['message' => 'Offre refusée']);
    }

    /**
     * Buyer cancels their own pending offer.
     */
    public function cancel(Request $request, Offer $offer): JsonResponse
    {
        if ($offer->buyer_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        if ($offer->statut !== Offer::STATUT_EN_ATTENTE) {
            return response()->json(['message' => 'Impossible d\'annuler cette offre'], 422);
        }

        $offer->update(['statut' => Offer::STATUT_ANNULEE]);

        return response()->json(['message' => 'Offre annulée']);
    }
}