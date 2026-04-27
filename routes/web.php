<?php

use App\Http\Controllers\Api\GameEmotionController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\GameSessionController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\StaffMessageController;
use App\Models\Game;
use App\Models\User;
use App\Services\FacialRecognitionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

/*
|--------------------------------------------------------------------------
| Test Routes (Desarrollo)
|--------------------------------------------------------------------------
*/

Route::get('/test-facial', function () {
    return view('test-facial');
})->name('test.facial');

Route::post('/test-facial', function (Request $request, FacialRecognitionService $facial) {
    $request->validate([
        'foto_registro' => 'required|file|mimes:jpg,jpeg,png',
        'foto_webcam' => 'required|file|mimes:jpg,jpeg,png',
    ]);

    $resultado = $facial->verifyFaces(
        $request->file('foto_registro')->getRealPath(),
        $request->file('foto_webcam')->getRealPath()
    );

    return response()->json([
        'success' => true,
        'resultado' => $resultado,
    ]);
})->name('test.facial');
Route::post('/game-sessions', [GameSessionController::class, 'store']);
/*
|--------------------------------------------------------------------------
| Autenticación Facial (Login Híbrido)
|--------------------------------------------------------------------------
*/

// Paso 1: Validar credenciales y existencia de foto facial
Route::post('/facial-login', function (Request $request) {
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    $user = User::where('email', $request->email)->first();

    if (! $user || ! Hash::check($request->password, $user->password)) {
        return response()->json([
            'success' => false,
            'message' => 'Credenciales incorrectas.',
        ], 401);
    }

    if (! $user->face_photo) {
        return response()->json([
            'success' => false,
            'message' => 'Este usuario no tiene foto facial registrada. Usa el login normal.',
        ], 422);
    }

    return response()->json([
        'success' => true,
        'has_face_photo' => true,
        'user_id' => $user->id,
    ]);
})->name('facial.login');

// Paso 2: Verificar rostro vía microservicio y autenticar
Route::post('/facial-verify', function (Request $request, FacialRecognitionService $facial) {
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
        'foto_webcam' => 'required|file|mimes:jpg,jpeg,png',
    ]);

    $user = User::where('email', $request->email)->first();

    if (! $user || ! Hash::check($request->password, $user->password)) {
        return response()->json([
            'success' => false,
            'message' => 'Credenciales incorrectas.',
        ], 401);
    }

    if (! $user->face_photo) {
        return response()->json([
            'success' => false,
            'message' => 'No hay foto facial registrada.',
        ], 422);
    }

    $facePhotoPath = storage_path('app/public/'.$user->face_photo);
    $webcamPath = $request->file('foto_webcam')->getRealPath();

    if (! file_exists($facePhotoPath)) {
        return response()->json([
            'success' => false,
            'message' => 'La foto facial del usuario no se encuentra en el servidor.',
        ], 404);
    }

    $resultado = $facial->verifyFaces($facePhotoPath, $webcamPath);

    if (($resultado['match'] ?? false) === true) {
        Auth::login($user);

        $user->load('role');
        $roleName = $user->role?->name;

        $redirectUrl = match (true) {
            $roleName === 'admin' || $user->role_id == 1 => '/admin',
            $roleName === 'gestor' || $user->role_id == 2 => '/gestor',
            default => '/',
        };

        return response()->json([
            'success' => true,
            'match' => true,
            'redirect_url' => $redirectUrl,
            'message' => '¡Verificación facial exitosa!',
            'confidence' => $resultado['confidence'] ?? null,
        ]);
    }

    return response()->json([
        'success' => true,
        'match' => false,
        'message' => 'Las caras no coinciden. Acceso denegado.',
        'error' => $resultado['error'] ?? null,
    ]);
})->name('facial.verify');

/*
|--------------------------------------------------------------------------
| API REST: Emociones (Datos Abstractos, Sin Biometría)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth'])->prefix('api')->name('api.')->group(function () {
    Route::get('/game/emotion', [GameEmotionController::class, 'index'])->name('game.emotion.index');
    Route::post('/game/emotion', [GameEmotionController::class, 'store'])->name('game.emotion.store');
});

/*
|--------------------------------------------------------------------------
| Páginas Principales (Inertia)
|--------------------------------------------------------------------------
*/
Route::get('/', function (Request $request) {
    return Inertia::render('Home', [
        'user' => $request->user(),
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('Home');

Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/admin', fn (Request $request) => Inertia::render('admin/AdminDashboard', [
        'user' => $request->user(),
    ]))->name('admin');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/chat', [MessageController::class, 'index'])->name('chat.index');
    Route::post('/chat/messages', [MessageController::class, 'store'])->name('chat.store');
    Route::get('/game/{id}', [GameController::class, 'play'])->name('game.play');
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
    Route::get('/staff-chat', [StaffMessageController::class, 'index'])->name('staff.chat.index');
    Route::post('/staff-chat/messages', [StaffMessageController::class, 'store'])->name('staff.chat.store');
});

Route::middleware(['auth', 'role:gestor'])->group(function () {
    Route::get('/gestor', fn (Request $request) => Inertia::render('gestor/Index', [
        'user' => $request->user(),
    ]))->name('gestor');
});

Route::get('/games', fn () => Inertia::render('Games', [
    'games' => Game::where('is_published', true)->get(),
]))->name('games');

Route::post('/logout', function (Request $request) {
    Auth::logout();

    $request->session()->invalidate();
    $request->session()->regenerateToken();

    return redirect('/');
})->name('logout');

require __DIR__.'/settings.php';
