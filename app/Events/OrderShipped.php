<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderShipped implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Order $order,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.'.$this->order->buyer_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'order.shipped';
    }

    public function broadcastWith(): array
    {
        return [
            'order_id' => $this->order->id,
            'numero_commande' => $this->order->numero_commande,
            'tracking_number' => $this->order->tracking_number,
            'transporteur' => $this->order->transporteur,
            'message' => 'Votre commande a été expédiée.',
            'created_at' => now()->toISOString(),
        ];
    }
}
