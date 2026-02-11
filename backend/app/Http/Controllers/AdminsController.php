<?php

namespace App\Http\Controllers;
use App\Models\Admins;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

use Illuminate\Http\Request;

class AdminsController extends Controller
{
    public function showLogin()
    {
        return view('superadmin.superadmin_login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'correo' => 'required|email',
            'contrasena' => 'required',
        ]);

        $admin = Admins::where('correo', $credentials['correo'])->first();

        if ($admin && Hash::check($credentials['contrasena'], $admin->contrasena)) {
            Auth::guard('superadmin')->login($admin);
            $request->session()->regenerate();
            return redirect()->route('superadmin.dashboard');
        }

        return back()->withErrors([
            'correo' => 'Credenciales incorrectas',
        ]);
    }

    public function logout(Request $request)
    {
        Auth::guard('superadmin')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('superadmin.login');
    }
}
