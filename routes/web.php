<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'home', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

// Route::middleware(['auth', 'verified'])->group(function () {
//     Route::inertia('dashboard', 'dashboard')->name('dashboard');
// });

Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::inertia('/admin', 'AdminDashboard');
});
Route::get('/games', function () {
    $games = \App\Models\Game::where('is_published', true)->get();
    return Inertia::render('Games', [
        'games' => $games
    ]);
})->name('games');
require __DIR__.'/settings.php';
