<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Message;

class MessageController extends Controller
{
    public function index()
    {
        $messages = Message::with('user')->get();

        return Inertia::render('Chat/Index', [
            'messages' => $messages,
            'user' => auth()->user()
        ]);
    }
    public function store(Request $request)
{
    $request->validate([
        'content' => 'required|min:5'
    ]);

    $message = Message::create([
        'content' => $request->content,
        'user_id' => auth()->id()
    ]);

    // Disparar el evento
    event(new \App\Events\MessageSend());

    return redirect()->back();
}
}
