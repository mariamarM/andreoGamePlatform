<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use Illuminate\Http\Request;
use App\Http\Controllers\MessageController;
use App\Models\User;

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

// ─── VERIFICACIÓN FACIAL PARA LOGIN ───────────────────────────────────────────

// Paso 1: Validar credenciales (email + password) sin iniciar sesión
Route::post('/facial-login', function (Request $request) {
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    $user = User::where('email', $request->email)->first();

    if (!$user || !Hash::check($request->password, $user->password)) {
        return response()->json([
            'success' => false,
            'message' => 'Credenciales incorrectas.'
        ], 401);
    }

    if (!$user->face_photo) {
        return response()->json([
            'success' => false,
            'message' => 'Este usuario no tiene foto facial registrada. Usa el login normal.'
        ], 422);
    }

    return response()->json([
        'success' => true,
        'has_face_photo' => true,
        'user_id' => $user->id,
    ]);
});

// Paso 2: Comparar foto webcam con la foto facial guardada del usuario
Route::post('/facial-verify', function (Request $request) {
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
        'foto_webcam' => 'required|file|mimes:jpg,jpeg,png',
    ]);

    $user = User::where('email', $request->email)->first();

    if (!$user || !Hash::check($request->password, $user->password)) {
        return response()->json([
            'success' => false,
            'message' => 'Credenciales incorrectas.'
        ], 401);
    }

    if (!$user->face_photo) {
        return response()->json([
            'success' => false,
            'message' => 'No hay foto facial registrada.'
        ], 422);
    }

    // Obtener la ruta absoluta de la foto facial guardada
    $facePhotoPath = storage_path('app/public/' . $user->face_photo);

    if (!file_exists($facePhotoPath)) {
        return response()->json([
            'success' => false,
            'message' => 'La foto facial del usuario no se encuentra en el servidor.'
        ], 404);
    }

    try {
        // Reutiliza el mismo patrón que /test-facial
        $response = Http::timeout(60)
            ->attach('img1', file_get_contents($facePhotoPath), 'registro.jpg')
            ->attach('img2', file_get_contents($request->file('foto_webcam')), 'webcam.jpg')
            ->post(env('FACIAL_SERVICE_URL'));

        $resultado = $response->json();

        // Comprobar si las caras coinciden
        if (isset($resultado['match']) && $resultado['match'] === true) {
            // Autenticar al usuario
            Auth::login($user);

            // Determinar la URL de redirección según el rol
            $user->load('role');
            $roleName = $user->role?->name;

            if ($roleName === 'admin' || $user->role_id == 1) {
                $redirectUrl = '/admin';
            } elseif ($roleName === 'gestor' || $user->role_id == 2) {
                $redirectUrl = '/gestor';
            } else {
                $redirectUrl = '/';
            }

            return response()->json([
                'success' => true,
                'match' => true,
                'redirect_url' => $redirectUrl,
                'message' => '¡Verificación facial exitosa!'
            ]);
        } else {
            return response()->json([
                'success' => true,
                'match' => false,
                'message' => 'Las caras no coinciden. Acceso denegado.'
            ]);
        }
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error al conectar con el servicio de verificación facial: ' . $e->getMessage()
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
});

Route::middleware(['auth'])->group(function () {
    Route::get('/chat', [App\Http\Controllers\MessageController::class, 'index'])->name('chat.index');
    Route::post('/chat/messages', [App\Http\Controllers\MessageController::class, 'store'])->name('chat.store');

    // Subida de foto facial para el perfil del usuario
    Route::post('/settings/face-photo', function (Request $request) {
        $request->validate([
            'face_photo' => 'required|image|mimes:jpg,jpeg,png|max:5120',
        ]);

        $user = $request->user();
        $path = $request->file('face_photo')->store('face_photos', 'public');
        $user->update(['face_photo' => $path]);

        return back()->with('status', 'Foto facial actualizada correctamente.');
    })->name('settings.face-photo');
});



Route::middleware(['auth', 'role:admin,gestor'])->group(function () {
    Route::get('/staff-chat', [App\Http\Controllers\StaffMessageController::class, 'index'])->name('staff.chat.index');
    Route::post('/staff-chat/messages', [App\Http\Controllers\StaffMessageController::class, 'store'])->name('staff.chat.store');
});

Route::middleware(['auth', 'role:gestor'])->group(function () {
    Route::inertia('/gestor', 'gestor/Index');
});


Route::get('/games', fn() => Inertia::render('Games', [
    'games' => \App\Models\Game::where('is_published', true)->get()
]))->name('games');

require __DIR__ . '/settings.php';

