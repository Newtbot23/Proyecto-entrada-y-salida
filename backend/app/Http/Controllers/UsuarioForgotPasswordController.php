<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;

class UsuarioForgotPasswordController extends Controller
{
    public function showLinkRequestForm()
    {
        return view('usuarios.forgot-password');
    }

    public function sendResetLink(Request $request)
    {
        $request->validate([
            'correo' => 'required|email'
        ]);

        $status = Password::broker('usuarios')->sendResetLink(
            ['correo' => $request->correo]
        );

        return $status === Password::RESET_LINK_SENT
            ? response()->json(['message' => 'Correo enviado'])
            : response()->json(['error' => 'No se pudo enviar'], 400);
    }
}
