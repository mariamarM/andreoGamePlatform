<?php

namespace App\Livewire;

use App\Events\MessageSend;
use App\Models\Message;
use Livewire\Attributes\On;
use Livewire\Component;

class ManageMessages extends Component
{
    public $content;
    public $mensajes;

    public function mount()
    {
        $this->getMensajes();
    }

    public function save()
    {
        $this->validate([
            'content' => 'required|min:5'
        ]);

        Message::create([
            'content' => $this->content,
            'user_id' => auth()->id()
        ]);

        $this->content = "";
        MessageSend::dispatch();
    }

    #[On('echo:chat,MessageSend')]
    public function getMensajes()
    {
        $this->mensajes = Message::with('user')->get();
    }

    public function render()
    {
        return view('livewire.manage-messages');
    }
}
