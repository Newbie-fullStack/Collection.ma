<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $reviews = Review::where('reviewed_id', $request->user()->id)
            ->where('masquee', false)
            ->with('reviewer:pseudo')
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($reviews);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'note' => 'required|integer|min:1|max:5',
            'commentaire' => 'nullable|string|max:1000',
        ]);

        $order = Order::findOrFail($validated['order_id']);

        if ($order->statut !== 'vire_vendeur') {
            return response()->json(['message' => 'Commande non éligible pour évaluation'], 422);
        }

        $existing = Review::where('order_id', $validated['order_id'])
            ->where('reviewer_id', $request->user()->id)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Vous avez déjà évalué cette commande'], 422);
        }

        $reviewedId = $request->user()->id === $order->buyer_id
            ? $order->seller_id
            : $order->buyer_id;

        $review = Review::create([
            'order_id' => $validated['order_id'],
            'reviewer_id' => $request->user()->id,
            'reviewed_id' => $reviewedId,
            'note' => $validated['note'],
            'commentaire' => $validated['commentaire'] ?? null,
        ]);

        // Update average note
        $this->updateAverageNote($reviewedId);

        return response()->json($review, 201);
    }

    protected function updateAverageNote(int $userId): void
    {
        $avg = Review::where('reviewed_id', $userId)
            ->where('signalee', false)
            ->where('masquee', false)  // hidden/flagged reviews don't count toward the average
            ->avg('note');
        User::where('id', $userId)->update(['note_moyenne' => round($avg, 2)]);
    }

    /**
     * The reviewed user (typically the seller) replies to a review.
     */
    public function reply(Request $request, Review $review): JsonResponse
    {
        if ($review->reviewed_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $validated = $request->validate([
            'reponse_vendeur_texte' => 'required|string|max:1000',
        ]);

        $review->update([
            'reponse_vendeur' => true,
            'reponse_vendeur_texte' => $validated['reponse_vendeur_texte'],
        ]);

        return response()->json($review->fresh());
    }

    /**
     * Flag a review for moderation (buyer/seller or admin).
     */
    public function flag(Request $request, Review $review): JsonResponse
    {
        $review->update([
            'moderation' => 'signalee',
            'signalee' => true,
        ]);

        return response()->json(['message' => 'Avis signalé pour modération']);
    }

    /**
     * Admin: list reviews for moderation (flagged or all).
     */
    public function adminIndex(Request $request): JsonResponse
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $query = Review::with(['reviewer:pseudo', 'reviewed:pseudo', 'order:numero_commande']);

        if ($request->moderation) {
            $query->where('moderation', $request->moderation);
        }

        return response()->json($query->orderByDesc('created_at')->paginate(30));
    }

    /**
     * Admin decides: validate, keep flagged, or hide a review.
     */
    public function administer(Request $request, Review $review): JsonResponse
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $validated = $request->validate([
            'action' => 'required|in:valider,masquer,reveler',
        ]);

        $review->update([
            'moderation' => 'validee', // moderation reflects last admin decision
            'signalee' => false,
            'masquee' => $validated['action'] === 'masquer',
        ]);

        $this->updateAverageNote($review->reviewed_id);

        return response()->json($review->fresh());
    }
}
