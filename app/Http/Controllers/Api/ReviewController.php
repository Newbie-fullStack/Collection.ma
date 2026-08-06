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
        $avg = Review::where('reviewed_id', $userId)->avg('note');
        User::where('id', $userId)->update(['note_moyenne' => round($avg, 2)]);
    }
}
