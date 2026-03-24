<?php

namespace App\Providers;

use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Illuminate\Http\JsonResponse;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request)
    {
        $user = $request->user();

        if ($user->role_id == 1) {
            return redirect()->intended('/admin/dashboard');
        } elseif ($user->role_id == 2) {
            return redirect()->intended('/gestor/index');
        }

        return redirect()->intended('/home');
    }
}
