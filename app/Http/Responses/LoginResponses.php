<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Illuminate\Http\JsonResponse;

class LoginResponse implements LoginResponseContract
{
    /**
     * Handle the login response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response|JsonResponse
     */
    public function toResponse($request)
    {
        // Si la petición es AJAX, devolver JSON
        if ($request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'message' => 'Login successful',
                'user' => $request->user(),
            ]);
        }

        // Redirigir a ruta por defecto
        return redirect()->intended('/admin/dashboard');
    }
}
