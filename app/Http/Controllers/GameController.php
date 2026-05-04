<?php

namespace App\Http\Controllers;

use App\Models\Game;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GameController extends Controller
{
    public function index()
    {
        return Inertia::render('Games', [
            'games' => Game::where('is_published', true)->get(),
        ]);
    }

    public function adminIndex()
    {
        return Inertia::render('gestor/Index', [
            'games' => Game::with('user')->get(),
            'isAdmin' => true,
        ]);
    }

    public function gestorIndex(Request $request)
    {
        return Inertia::render('gestor/Index', [
            'games' => Game::where('user_id', $request->user()->id)->get(),
            'isAdmin' => false,
        ]);
    }

    public function create()
    {
        return Inertia::render('gestor/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'url' => 'required|url',
        ]);

        Game::create([
            'title' => $request->title,
            'description' => $request->description,
            'url' => $request->url,
            'is_published' => $request->is_published ?? true,
            'user_id' => $request->user()->id,
        ]);

        return redirect()->route($request->user()->role_id == 1 ? 'admin.games' : 'gestor.games')->with('success', 'Juego creado.');
    }

    public function edit($id)
    {
        $game = Game::findOrFail($id);
        return Inertia::render('gestor/Edit', ['game' => $game]);
    }

    public function update(Request $request, $id)
    {
        $game = Game::findOrFail($id);
        
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'url' => 'required|url',
        ]);

        $game->update($request->all());

        return redirect()->route($request->user()->role_id == 1 ? 'admin.games' : 'gestor.games')->with('success', 'Juego actualizado.');
    }

    public function destroy(Request $request, $id)
    {
        $game = Game::findOrFail($id);
        $game->delete();

        return back()->with('success', 'Juego eliminado.');
    }

    public function play(Request $request, int $id)
    {
        $game = Game::findOrFail($id);
        $user = $request->user();

        // Obtener ranking (top 5 mejores puntuaciones únicas por usuario)
        $ranking = \App\Models\GameSession::where('game_id', $id)
            ->select('user_id', \DB::raw('MAX(score) as high_score'))
            ->groupBy('user_id')
            ->orderByDesc('high_score')
            ->with('user:id,name')
            ->take(5)
            ->get();

        // Obtener mejor puntuación del usuario actual
        $userBestScore = \App\Models\GameSession::where('game_id', $id)
            ->where('user_id', $user->id)
            ->max('score') ?? 0;

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
                'role_id' => $user->role_id,
            ],
            'ranking' => $ranking,
            'userBestScore' => $userBestScore,
            'messages' => \App\Models\Message::where('room', 'global_game')
                ->whereHas('user', function($query) {
                    $query->where('role_id', 3); // Solo usuarios normales
                })
                ->with('user:id,name')
                ->latest()
                ->take(50)
                ->get()
                ->reverse()
                ->values(),
        ]);
    }
}
