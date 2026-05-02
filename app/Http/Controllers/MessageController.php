<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Message;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class MessageController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Obtener la lista de conversaciones (salas únicas)
        if ($user->role_id == 1 || $user->role_id == 2) {
            // Admin/Gestor: Todas las salas de usuarios individuales
            $conversations = Message::select('room', DB::raw('MAX(created_at) as last_message_at'))
                ->where('room', 'like', 'user_%')
                ->groupBy('room')
                ->orderByDesc('last_message_at')
                ->get()
                ->map(function ($msg) {
                    $userId = str_replace('user_', '', $msg->room);
                    $otherUser = User::find($userId);
                    return [
                        'room' => $msg->room,
                        'name' => $otherUser ? $otherUser->name : 'Usuario Desconocido',
                        'last_message_at' => $msg->last_message_at,
                    ];
                });
        } else {
            // Player: Solo su propia sala y soporte
            $conversations = [
                [
                    'room' => 'user_' . $user->id,
                    'name' => 'Soporte Técnico',
                    'last_message_at' => Message::where('room', 'user_' . $user->id)->max('created_at'),
                ]
            ];
        }

        // Si se pide una sala específica
        $activeRoom = $request->query('room', ($user->role_id == 3 ? 'user_' . $user->id : null));
        $messages = $activeRoom 
            ? Message::where('room', $activeRoom)->with('user:id,name')->latest()->take(50)->get()->reverse()->values()
            : [];

        return Inertia::render('chat/Index', [
            'conversations' => $conversations,
            'messages' => $messages,
            'activeRoom' => $activeRoom,
            'user' => $user
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'message' => 'required|min:1',
            'room' => 'nullable|string'
        ]);

        $room = $request->input('room');
        if (empty($room)) {
            $room = 'public';
        }

        $message = Message::create([
            'content' => $request->message,
            'user_id' => auth()->id(),
            'room' => $room,
        ]);

        event(new \App\Events\MessageSent($message));

        return back();
    }
}
