<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GameController;
use App\Models\Game;
use App\Models\Role;
use App\Models\User;
Route::get('/games', [GameController::class, 'devolverJson']);
Route::get('/games/{id}', [GameController::class, 'show']);
Route::post('/games', [GameController::class, 'store']);
Route::put('/games/{id}', [GameController::class, 'update']);
Route::delete('/games/{id}', [GameController::class, 'destroy']);
Route::get('/users', function () {
    return response()->json(User::all());
});

Route::middleware('auth')->group(function () {
    Route::post('/game-sessions', [GameSessionController::class, 'store']);
});
Route::get('/roles', function () {
    return response()->json(Role::all());
});
Route::get('/test-db', function () {
    try {
        DB::connection()->getPdo();
        $users = DB::table('users')->count();

        return [
            "conexion" => "OK",
            "usuarios_en_bd" => $users
        ];
    } catch (\Exception $e) {
        return $e->getMessage();
    }
});
