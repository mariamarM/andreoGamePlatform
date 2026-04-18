<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GameEmotionLog;
use Illuminate\Http\Request;

class GameEmotionController extends Controller
{
    /**
     * Listar las emociones propias del usuario autenticado.
     * GET /api/game/emotion
     */
    public function index(Request $request)
    {
        $logs = GameEmotionLog::where('user_id', $request->user()->id)
            ->with('game:id,title')
            ->orderBy('detected_at', 'desc')
            ->limit(100)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $logs,
        ]);
    }

    /**
     * Registrar una detección de emoción (datos abstractos, sin biometría).
     * POST /api/game/emotion
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'emotion' => 'required|string|max:32',
            'confidence' => 'required|numeric|min:0|max:1',
            'game_id' => 'nullable|exists:games,id',
            'detected_at' => 'nullable|date',
            'metadata' => 'nullable|array',
        ]);

        $log = GameEmotionLog::create([
            'user_id' => $request->user()->id,
            'game_id' => $validated['game_id'] ?? null,
            'emotion' => $validated['emotion'],
            'confidence' => $validated['confidence'],
            'detected_at' => $validated['detected_at'] ?? now(),
            'metadata' => $validated['metadata'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'log_id' => $log->id,
        ], 201);
    }
}
