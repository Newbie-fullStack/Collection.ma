<?php

namespace App\Events;

use App\Models\Listing;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AuctionWon implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Listing $listing,
        public int $winnerId,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.'.$this->winnerId),
            new PrivateChannel('listing.'.$this->listing->id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'auction.won';
    }

    public function broadcastWith(): array
    {
        return [
            'listing_id' => $this->listing->id,
            'listing_titre' => $this->listing->titre,
            'numero_auto' => $this->listing->numero_auto,
            'prix_final' => $this->listing->prix_actuel,
            'message' => 'Félicitations ! Vous avez remporté cette enchère.',
            'created_at' => now()->toISOString(),
        ];
    }
}
