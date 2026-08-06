<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_one_id',
        'user_two_id',
        'listing_id',
        'last_message_id',
        'last_message_at',
    ];

    protected function casts(): array
    {
        return [
            'last_message_at' => 'datetime',
        ];
    }

    public function userOne(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_one_id');
    }

    public function userTwo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_two_id');
    }

    public function listing(): BelongsTo
    {
        return $this->belongsTo(Listing::class);
    }

    public function lastMessage(): BelongsTo
    {
        return $this->belongsTo(Message::class, 'last_message_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class)->orderByDesc('created_at');
    }

    /**
     * Get the other participant in the conversation.
     */
    public function getOtherParticipant(int $userId): ?User
    {
        if ($this->user_one_id === $userId) {
            return $this->userTwo;
        }
        if ($this->user_two_id === $userId) {
            return $this->userOne;
        }
        return null;
    }

    /**
     * Check if a user is part of this conversation.
     */
    public function belongsToUser(int $userId): bool
    {
        return $this->user_one_id === $userId || $this->user_two_id === $userId;
    }

    /**
     * Get unread count for a specific user.
     */
    public function getUnreadCount(int $userId): int
    {
        return $this->messages()
            ->where('sender_id', '!=', $userId)
            ->where('lu', false)
            ->count();
    }

    /**
     * Find or create conversation between two users for a listing.
     */
    public static function findOrCreate(int $userIdOne, int $userIdTwo, ?int $listingId = null): self
    {
        // Normalize order to ensure unique constraint works
        if ($userIdOne > $userIdTwo) {
            [$userIdOne, $userIdTwo] = [$userIdTwo, $userIdOne];
        }

        return static::firstOrCreate(
            [
                'user_one_id' => $userIdOne,
                'user_two_id' => $userIdTwo,
                'listing_id' => $listingId,
            ],
            [
                'last_message_at' => now(),
            ]
        );
    }
}
