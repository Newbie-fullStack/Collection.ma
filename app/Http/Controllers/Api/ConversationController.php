<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConversationController extends Controller
{
    /**
     * List conversations for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $conversations = Conversation::where('user_one_id', $user->id)
            ->orWhere('user_two_id', $user->id)
            ->with([
                'userOne:id,pseudo',
                'userTwo:id,pseudo',
                'listing:id,titre,numero_auto',
                'lastMessage:id,contenu,created_at,sender_id',
            ])
            ->orderByDesc('last_message_at')
            ->paginate(20);

        // Add unread count for each conversation
        $conversations->getCollection()->transform(function ($conv) use ($user) {
            $conv->unread_count = $conv->getUnreadCount($user->id);
            $conv->other_user = $conv->getOtherParticipant($user->id);
            return $conv;
        });

        return response()->json($conversations);
    }

    /**
     * Get total unread count across all conversations.
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $user = $request->user();

        $totalUnread = Message::whereHas('conversation', function ($q) use ($user) {
            $q->where('user_one_id', $user->id)
              ->orWhere('user_two_id', $user->id);
        })
        ->where('sender_id', '!=', $user->id)
        ->where('lu', false)
        ->count();

        return response()->json(['count' => $totalUnread]);
    }

    /**
     * Get or create a conversation with another user.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'listing_id' => 'nullable|exists:listings,id',
        ]);

        $user = $request->user();

        if ($validated['user_id'] === $user->id) {
            return response()->json(['message' => 'Impossible de discuter avec soi-même'], 422);
        }

        $conversation = Conversation::findOrCreate(
            $user->id,
            $validated['user_id'],
            $validated['listing_id'] ?? null
        );

        return response()->json($conversation->load([
            'userOne:id,pseudo',
            'userTwo:id,pseudo',
            'listing:id,titre,numero_auto',
        ]));
    }

    /**
     * Get messages for a conversation.
     */
    public function messages(Request $request, Conversation $conversation): JsonResponse
    {
        $user = $request->user();

        if (! $conversation->belongsToUser($user->id)) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $messages = $conversation->messages()
            ->with('sender:id,pseudo')
            ->orderBy('created_at', 'asc')
            ->paginate(50);

        return response()->json($messages);
    }

    /**
     * Send a message in a conversation.
     */
    public function sendMessage(Request $request, Conversation $conversation): JsonResponse
    {
        $user = $request->user();

        if (! $conversation->belongsToUser($user->id)) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $validated = $request->validate([
            'contenu' => 'required|string|max:5000',
        ]);

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'contenu' => $validated['contenu'],
        ]);

        $conversation->update([
            'last_message_id' => $message->id,
            'last_message_at' => now(),
        ]);

        return response()->json($message->load('sender:id,pseudo'), 201);
    }

    /**
     * Mark all messages in a conversation as read.
     */
    public function markAsRead(Request $request, Conversation $conversation): JsonResponse
    {
        $user = $request->user();

        if (! $conversation->belongsToUser($user->id)) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $conversation->messages()
            ->where('sender_id', '!=', $user->id)
            ->where('lu', false)
            ->update(['lu' => true]);

        return response()->json(['message' => 'Marqué comme lu']);
    }
}
