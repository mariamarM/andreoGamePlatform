<?php
use App\Http\Controllers\GameController;
use App\Models\Game;
use App\Models\User;
Route::get('/games', [GameController::class, 'devolverJson']);
Route::get('/games/{id}', [GameController::class, 'show']);
Route::post('/games', [GameController::class, 'store']);
Route::get('/users', function () {
    return response()->json(User::all());
});
