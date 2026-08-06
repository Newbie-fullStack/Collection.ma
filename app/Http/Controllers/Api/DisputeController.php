<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dispute;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DisputeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $disputes = Dispute::where('initiator_id', $request->user()->id)
            ->with('order:numero_commande')
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($disputes);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'raison' => 'required|in:objet_non_recu,objet_endommage,objet_different,non_conforme,retard_livraison,arnaque,autre',
            'description' => 'required|string',
        ]);

        $order = Order::findOrFail($validated['order_id']);

        if (! in_array($order->statut, ['expedie', 'sequestre'])) {
            return response()->json(['message' => 'Commande non éligible pour litige'], 422);
        }

        $existing = Dispute::where('order_id', $validated['order_id'])
            ->where('statut', '!=', 'cloturee')
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Un litige est déjà en cours pour cette commande'], 422);
        }

        $dispute = Dispute::create([
            'order_id' => $validated['order_id'],
            'initiator_id' => $request->user()->id,
            'raison' => $validated['raison'],
            'description' => $validated['description'],
        ]);

        $order->update(['statut' => 'litige']);

        return response()->json($dispute, 201);
    }

    public function show(Dispute $dispute): JsonResponse
    {
        $user = request()->user();
        if ($dispute->initiator_id !== $user->id && ! $user->isAdmin()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        return response()->json($dispute->load(['order', 'initiator:pseudo']));
    }
}
