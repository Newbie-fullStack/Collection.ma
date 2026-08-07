<?php

namespace App\Http\Controllers\Api;

use App\Events\NewBidPlaced;
use App\Http\Controllers\Controller;
use App\Models\Bid;
use App\Models\Listing;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BidController extends Controller
{
    public function index(Request $request, Listing $listing): JsonResponse
    {
        $bids = $listing->bids()
            ->with('bidder:pseudo')
            ->orderByDesc('montant')
            ->paginate(20);

        return response()->json($bids);
    }

    public function store(Request $request, Listing $listing): JsonResponse
    {
        if ($listing->mode !== 'enchere') {
            return response()->json(['message' => 'Ce mode de vente ne permet pas les enchères'], 422);
        }

        if ($listing->statut !== 'active') {
            return response()->json(['message' => 'Cette annonce n\'est plus active'], 422);
        }

        if ($listing->isExpired()) {
            return response()->json(['message' => 'Cette enchère est terminée'], 422);
        }

        if ($listing->seller_id === $request->user()->id) {
            return response()->json(['message' => 'Vous ne pouvez pas enchérir sur votre propre annonce'], 422);
        }

        $validated = $request->validate([
            'montant' => 'required|numeric|min:0.01',
            'auto_bid_max' => 'nullable|numeric|min:0.01|gt:montant',
        ]);

        $minBid = $listing->prix_actuel ? $listing->prix_actuel + 1 : $listing->prix_vente;

        if ($validated['montant'] < $minBid) {
            return response()->json([
                'message' => "L'enchère minimale est de {$minBid} DH",
            ], 422);
        }

        $bid = Bid::create([
            'listing_id' => $listing->id,
            'bidder_id' => $request->user()->id,
            'montant' => $validated['montant'],
            'auto_bid_max' => $validated['auto_bid_max'] ?? null,
            'is_auto_bid' => isset($validated['auto_bid_max']),
            'statut' => 'active',
        ]);

        $listing->update(['prix_actuel' => $validated['montant']]);

        // Dispatch real-time event
        NewBidPlaced::dispatch($bid, $listing);

        // Create notification for seller
        Notification::create([
            'user_id' => $listing->seller_id,
            'type' => 'bid_placed',
            'title' => 'Nouvelle enchère',
            'title_ar' => 'licitة جديدة',
            'message' => "{$request->user()->pseudo} a enchéri {$validated['montant']} DH sur \"{$listing->titre}\"",
            'message_ar' => "{$request->user()->pseudo} قدم عرض {$validated['montant']} DH على \"{$listing->titre}\"",
            'link' => "/listings/{$listing->numero_auto}",
            'data' => [
                'listing_id' => $listing->id,
                'bid_id' => $bid->id,
                'montant' => $validated['montant'],
            ],
        ]);

        // Handle auto-bidding
        if (isset($validated['auto_bid_max'])) {
            $this->processAutoBids($listing, $request->user()->id);
        }

        return response()->json($bid->load('bidder:pseudo'), 201);
    }

    protected function processAutoBids(Listing $listing, int $excludeUserId): void
    {
        $autoBids = Bid::where('listing_id', $listing->id)
            ->where('bidder_id', '!=', $excludeUserId)
            ->whereNotNull('auto_bid_max')
            ->where('auto_bid_max', '>', $listing->prix_actuel)
            ->orderBy('auto_bid_max', 'desc')
            ->get();

        foreach ($autoBids as $autoBid) {
            $nextAmount = $listing->prix_actuel + 1;
            if ($nextAmount <= $autoBid->auto_bid_max) {
                $autoBid->update([
                    'montant' => $nextAmount,
                    'is_auto_bid' => true,
                ]);
                $listing->update(['prix_actuel' => $nextAmount]);
                break;
            }
        }
    }

    public function myBids(Request $request): JsonResponse
    {
        $bids = Bid::where('bidder_id', $request->user()->id)
            ->with('listing:numero_auto,titre,statut,mode,date_expiration,prix_actuel')
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($bids);
    }

    public function myListingBids(Request $request): JsonResponse
    {
        $bids = Bid::whereHas('listing', fn ($q) => $q->where('seller_id', $request->user()->id))
            ->with([
                'listing:numero_auto,titre,mode,statut,date_expiration,prix_actuel,prix_vente',
                'bidder:pseudo',
            ])
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($bids);
    }
}
