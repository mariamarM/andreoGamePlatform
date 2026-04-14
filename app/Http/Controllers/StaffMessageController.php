<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Message;

class StaffMessageController extends Controller
{
    public function index()
    {
        $messages = Message::where('room', 'staff')->with('user')->get();

        return Inertia::render('chat/StaffChat', [
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
            'user_id' => auth()->id(),
            'room' => 'staff'
        ]);

        // Disparar el evento
        event(new \App\Events\MessageSend());

        return redirect()->route('staff.chat.index');
    }
}
