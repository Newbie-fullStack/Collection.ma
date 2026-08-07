<?php

namespace App\Events;

use App\Models\Bid;
use App\Models\Listing;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewBidPlaced implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Bid $bid,
        public Listing $listing,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('listing.'.$this->listing->id),
            new PrivateChannel('user.'.$this->listing->seller_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'bid.placed';
    }

    public function broadcastWith(): array
    {
        return [
            'bid_id' => $this->bid->id,
            'montant' => $this->bid->montant,
            'bidder_pseudo' => $this->bid->bidder->pseudo ?? 'Anonyme',
            'listing_id' => $this->listing->id,
            'listing_titre' => $this->listing->titre,
            'numero_auto' => $this->listing->numero_auto,
            'created_at' => $this->bid->created_at->toISOString(),
        ];
    }
}
