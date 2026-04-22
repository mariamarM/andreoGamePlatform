<?php

namespace App\Http\Controllers;

use App\Models\GameSession;
use Illuminate\Http\Request;

class GameSessionController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'game_id' => 'required|exists:games,id',
            'score' => 'required|integer',
            'data' => 'nullable',
        ]);

        $session = GameSession::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'game_id' => $request->game_id,
            ],
            [
                'score' => $request->score,
                'data' => $request->data,
            ]
        );

        return response()->json([
            'success' => true,
            'session' => $session,
        ]);
    }
}
