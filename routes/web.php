<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Laravel\Facades\Inertia;
use Laravel\Fortify\Features;

// 1. Ruta GET: Sirve para MOSTRAR la página con el formulario y la cámara
Route::get('/test-facial', function () {
    return view('test-facial'); // Asegúrate de que tu archivo se llama test-facial.blade.php
});

// 2. Ruta POST: Sirve para PROCESAR las fotos cuando el usuario le da a "Enviar"
Route::post('/test-facial', function (Request $request) {
    // 1. Verificación básica
    if (!$request->hasFile('foto_registro') || !$request->hasFile('foto_webcam')) {
        return back()->withErrors(['Faltan imágenes o superan el límite de PHP.']);
    }

    $url = env('FACIAL_SERVICE_URL', 'http://10.72.103.250:8181/verify');

    try {
        // 2. Comunicación con el microservicio Docker
        $response = Http::timeout(60)
            ->attach('img1', file_get_contents($request->file('foto_registro')), 'reg.jpg')
            ->attach('img2', file_get_contents($request->file('foto_webcam')), 'web.jpg')
            ->post($url);

        // 3. Devolución de resultados a la vista
        $resultadoPython = $response->json();
        return view('test-facial', ['resultado' => $resultadoPython]);
    } catch (\Exception $e) {
        return back()->withErrors(['Error de conexión con Docker: ' . $e->getMessage()]);
    }
});

Route::inertia('/', 'Home', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('Home');


Route::middleware(['auth', 'role:admin'])->group(function () {

    Route::get('/admin', fn() => Inertia::render('admin/AdminDashboard', [
        'user' => auth()->user(),
    ]))->name('admin');


});
Route::post('/logout', function () {
    Auth::logout();
    return redirect('/');
})->name('logout');

Route::middleware(['auth', 'role:gestor'])->group(function () {
    Route::inertia('/gestor', 'gestor/Index');
});

// Route::post('/test-facial', function (Request $request) {
//     // 2000 es lo de los megas (yo lo tengo a 40 pero para seguir la practica)
//     $validator = Validator::make($request->all(), [
//         'foto_registro' => 'required|image|max:20000',
//         'foto_webcam' => 'required|image|max:20000',
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


Route::get('/games', fn() => Inertia::render('Games', [
    'games' => \App\Models\Game::where('is_published', true)->get()
]))->name('games');

require __DIR__ . '/settings.php';
