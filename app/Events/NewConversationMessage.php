<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewConversationMessage implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Message $message;

    public function __construct(Message $message)
    {
        // Load sender pseudo so the payload is ready to render.
        $message->load('sender:id,pseudo');
        $this->message = $message;
    }

    public function broadcastOn(): array
    {
        $conversation = $this->message->conversation;

        return [
            new PrivateChannel('conversation.'.$conversation->id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'message.new';
    }
}