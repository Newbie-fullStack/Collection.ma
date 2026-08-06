<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    /**
     * Messages are admin-only mailbox — no buyer↔seller direct messaging.
     */
    public function index(Request $request): JsonResponse
    {
        $messages = Message::where('sender_id', $request->user()->id)
            ->with('adminRecipient:pseudo')
            ->orderByDesc('created_at')
            ->paginate(30);

        return response()->json($messages);
    }

    public function adminMessages(Request $request): JsonResponse
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $messages = Message::toAdmin()
            ->with('sender:pseudo,nom,prenom')
            ->orderByDesc('created_at')
            ->paginate(30);

        return response()->json($messages);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'contenu' => 'required|string',
            'listing_id' => 'nullable|exists:listings,id',
            'order_id' => 'nullable|exists:orders,id',
        ]);

        // All messages go to admin
        $adminId = User::where('role', 'admin')->first()?->id;

        $message = Message::create([
            'sender_id' => $request->user()->id,
            'admin_recipient_id' => $adminId,
            'listing_id' => $validated['listing_id'] ?? null,
            'order_id' => $validated['order_id'] ?? null,
            'contenu' => $validated['contenu'],
        ]);

        return response()->json($message, 201);
    }

    public function markAsRead(Request $request, Message $message): JsonResponse
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $message->update(['lu' => true]);

        return response()->json(['message' => 'Marqué comme lu']);
    }
}
