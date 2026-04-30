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

    public function show($id)
    {
        $game = Game::findOrFail($id);
        
        return response()->json($game);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'url' => 'required|url',
            'user_id' => 'required|exists:users,id',
        ]);

        $game = Game::create($request->all());

        return response()->json($game, 201);
    }

    public function update(Request $request, $id)
    {
        $game = Game::findOrFail($id);
        
        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'url' => 'sometimes|required|url',
        ]);

        $game->update($request->all());

        return response()->json($game);
    }

    public function destroy($id)
    {
        $game = Game::findOrFail($id);
        $game->delete();

        return response()->json(null, 204);
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
