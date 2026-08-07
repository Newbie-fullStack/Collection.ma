<?php

use Illuminate\Support\Facades\Broadcast;

// Auction / listing channel — any authenticated user viewing the auction.
Broadcast::channel('listing.{listingId}', function ($user) {
    return $user ? ['id' => (int) $user->id, 'pseudo' => $user->pseudo] : false;
});

// Personal notification channel — owner only.
Broadcast::channel('user.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId ? ['id' => (int) $user->id, 'pseudo' => $user->pseudo] : false;
});

// Conversation channel — only the two participants.
Broadcast::channel('conversation.{conversationId}', function ($user, $conversationId) {
    $conversation = \App\Models\Conversation::find($conversationId);

    return $conversation && $conversation->belongsToUser($user->id)
        ? ['id' => (int) $user->id, 'pseudo' => $user->pseudo]
        : false;
});