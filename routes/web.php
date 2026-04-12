<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Laravel\Facades\Inertia;
use Laravel\Fortify\Features;
use Illuminate\Http\Request;
use App\Http\Controllers\MessageController;
// 1. Ruta GET: Sirve para MOSTRAR la página con el formulario y la cámara
Route::get('/test-facial', function () {
    return view('test-facial'); // Asegúrate de que tu archivo se llama test-facial.blade.php
});

// 2. Ruta POST: Sirve para PROCESAR las fotos cuando el usuario le da a "Enviar"
Route::post('/test-facial', function (Request $request) {
    try {
        $response = Http::timeout(60)
            ->attach('img1', file_get_contents($request->file('foto_registro')), 'reg.jpg')
            ->attach('img2', file_get_contents($request->file('foto_webcam')), 'web.jpg')
            ->post(env('FACIAL_SERVICE_URL'));

        $resultadoPython = $response->json();

        return response()->json([
            'success' => true,
            'resultado' => $resultadoPython
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ], 500);
    }
});

Route::inertia('/', 'Home', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('Home');


Route::middleware(['auth', 'role:admin'])->group(function () {

    Route::get('/admin', fn() => Inertia::render('admin/AdminDashboard', [
        'user' => auth()->user(),
    ]))->name('admin');

   Route::get('/chat', [App\Http\Controllers\MessageController::class, 'index'])->name('chat.index');
});

Route::post('/logout', function () {
    Auth::logout();
    return redirect('/');
})->name('logout');

Route::middleware(['auth', 'role:gestor'])->group(function () {
    Route::inertia('/gestor', 'gestor/Index');
});


Route::get('/games', fn() => Inertia::render('Games', [
    'games' => \App\Models\Game::where('is_published', true)->get()
]))->name('games');

require __DIR__ . '/settings.php';
