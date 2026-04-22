<?php

namespace App\Http\Controllers;

use App\Models\Game;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GameController extends Controller
{
    public function devolverJson()
    {
        return response()->json(Game::all());
    }

    public function play(Request $request, int $id)
    {
        $game = Game::findOrFail($id);
        $user = $request->user();

        return Inertia::render('GameView', [
            'game' => [
                'id' => $game->id,
                'title' => $game->title,
                'url' => $game->url,
            ],
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'messages' => [],
        ]);
    }
}
