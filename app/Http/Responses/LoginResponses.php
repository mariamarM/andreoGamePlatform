<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Illuminate\Http\JsonResponse;

class LoginResponses implements LoginResponseContract
{
    public function toResponse($request)
    {
        $user = $request->user();

        if ($user->role_id == 1) {
            return redirect()->intended('/admin');
        } elseif ($user->role_id == 2) {
            return redirect()->intended('/gestor');
        }

        return redirect()->intended('/');
    }
}
