<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;
    public $user;
    public $room;

    public function __construct(Message $message)
    {
        $this->message = $message;
        $this->user = $message->user;
        $this->room = $message->room;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('chat'),
        ];
    }
}
