<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request)
    {
        $user = auth()->user();

        if ($user->role_id == 1) {
            return redirect('/admin');
        }

        if ($user->role_id == 2) {
            return redirect('/gestor');
        }

        return redirect('/');
    }
}
