<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Admins;
use App\Models\Usuarios;
use App\Mail\RecoveryCodeMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class PasswordRecoveryController extends Controller
{
    /**
     * Show the forgot password form.
     */
    public function showForgotForm(Request $request)
    {
        $type = $request->is('superadmin/*') ? 'superadmin' : 'usuario';
        return view('auth.forgot-password', compact('type'));
    }

    /**
     * Generate and send the 6-digit recovery code.
     */
    public function sendResetCode(Request $request)
    {
        $request->validate([
            'correo' => 'required|email',
        ]);

        $type = $request->input('type');
        $isSuperAdmin = $type === 'superadmin';
        $model = $isSuperAdmin ? Admins::class : Usuarios::class;
        $userType = $isSuperAdmin ? 'admins' : 'usuarios';

        $user = $model::where('correo', $request->correo)->first();

        if (!$user) {
            return back()->withErrors(['correo' => 'No encontramos un usuario con ese correo electrónico.'])->withInput();
        }

        // Generate 6-digit code
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Store code in database
        DB::table('password_reset_codes')->insert([
            'email' => $request->correo,
            'code' => $code,
            'user_type' => $userType,
            'created_at' => Carbon::now(),
        ]);

        // Send Email
        try {
            Mail::to($request->correo)->send(new RecoveryCodeMail($code));
        } catch (\Exception $e) {
            Log::error('Error sending recovery email: ' . $e->getMessage());
            return back()->withErrors(['correo' => 'Error al enviar el correo electrónico. Por favor, inténtalo de nuevo más tarde.'])->withInput();
        }

        return redirect()->route($isSuperAdmin ? 'superadmin.verify.form' : 'verify.form', ['email' => $request->correo]);
    }

    /**
     * Show the code verification form.
     */
    public function showVerifyForm(Request $request)
    {
        $type = $request->is('superadmin/*') ? 'superadmin' : 'usuario';
        $email = $request->query('email');
        return view('auth.verify-code', compact('type', 'email'));
    }

    /**
     * Verify the 6-digit code.
     */
    public function verifyCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
        ]);

        $type = $request->input('type');
        $isSuperAdmin = $type === 'superadmin';
        $userType = $isSuperAdmin ? 'admins' : 'usuarios';

        $record = DB::table('password_reset_codes')
            ->where('email', $request->email)
            ->where('code', $request->code)
            ->where('user_type', $userType)
            ->where('created_at', '>', Carbon::now()->subMinutes(60))
            ->first();

        if (!$record) {
            return back()->withErrors(['code' => 'El código es inválido o ha expirado.'])->withInput();
        }

        // Redirect to reset password form with temporary signed URL or session flag
        session(['reset_email' => $request->email, 'reset_type' => $type, 'code_verified' => true]);

        return redirect()->route($isSuperAdmin ? 'superadmin.reset.form' : 'reset.form');
    }

    /**
     * Show the password reset form.
     */
    public function showResetForm(Request $request)
    {
        if (!session('code_verified')) {
            return redirect()->route($request->is('superadmin/*') ? 'superadmin.forgot.form' : 'forgot.form');
        }

        $type = session('reset_type');
        $email = session('reset_email');
        return view('auth.reset-password', compact('type', 'email'));
    }

    /**
     * Reset the user password.
     */
    public function resetPassword(Request $request)
    {
        if (!session('code_verified')) {
             return redirect()->route($request->is('superadmin/*') ? 'superadmin.forgot.form' : 'forgot.form');
        }

        $request->validate([
            'contrasena' => 'required|min:8|confirmed',
        ]);

        $type = session('reset_type');
        $email = session('reset_email');
        $isSuperAdmin = $type === 'superadmin';
        $model = $isSuperAdmin ? Admins::class : Usuarios::class;

        $user = $model::where('correo', $email)->first();

        if (!$user) {
            return back()->withErrors(['message' => 'Error al restablecer la contraseña.']);
        }

        $user->contrasena = Hash::make($request->contrasena);
        $user->save();

        // Delete the used code
        DB::table('password_reset_codes')->where('email', $email)->delete();

        // Clear session
        session()->forget(['reset_email', 'reset_type', 'code_verified']);

        return redirect()->route($isSuperAdmin ? 'superadmin.login' : 'login')->with('success', 'Contraseña restablecida con éxito.');
    }
}
