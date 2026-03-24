<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'home', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware([ 'role:admin'])->group(function () {
        Route::inertia('/admin', 'AdminDashboard');

    //poner la ruta de cada pagina sin pasarse
});

Route::middleware(['auth', 'role:gestor'])->group(function () {
    Route::inertia('/gestor', 'Index');
});
// Route::post('/test-facial', function (Request $request) {
//     // 2000 es lo de los megas (yo lo tengo a 40 pero para seguir la practica)
//     $validator = Validator::make($request->all(), [
//         'foto_registro' => 'required|image|max:20000',
//         'foto_webcam'   => 'required|image|max:20000',
//     ]);

//     if ($validator->fails()) {
//         return back()->withErrors($validator)->withInput();
//     }

//     $url = env('FACIAL_SERVICE_URL');

//     try {
//         $response = Http::timeout(60)
//             ->attach(
//                 'img1',
//                 file_get_contents($request->file('foto_registro')->getRealPath()),
//                 $request->file('foto_registro')->getClientOriginalName()
//             )
//             ->attach(
//                 'img2',
//                 file_get_contents($request->file('foto_webcam')->getRealPath()),
//                 $request->file('foto_webcam')->getClientOriginalName()
//             )
//             ->post($url);

//         // esto hace q si o si te devuelva el json con  el true
//         // or false del match de las otos
//         if ($response->successful()) {
//             $datos = $response->json();
//             return view('testfacial', ['resultado' => $datos]);
//         } else {
//             return back()->withErrors(['Error: El microservicio facial respondió con código ' . $response->status()]);
//         }

//     } catch (\Exception $e) {
//         return back()->withErrors(['Error: ' . $e->getMessage()]);
//     }
// });


Route::get('/games', function () {
    $games = \App\Models\Game::where('is_published', true)->get();
    return Inertia::render('Games', [
        'games' => $games
    ]);
})->name('games');

require __DIR__.'/settings.php';
