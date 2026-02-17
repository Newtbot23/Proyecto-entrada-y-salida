<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\Usuarios;

Route::get('/test-password/{email}', function ($email) {
    $user = Usuarios::where('correo', $email)->first();
    
    if (!$user) {
        return response()->json([
            'error' => 'Usuario no encontrado'
        ]);
    }
    
    return response()->json([
        'email' => $user->correo,
        'password_hash' => $user->contrasena,
        'hash_length' => strlen($user->contrasena),
        'hash_starts_with_dollar2y' => substr($user->contrasena, 0, 4) === '$2y$',
        'test_password_12345678' => Hash::check('12345678', $user->contrasena),
    ]);
});

Route::post('/test-set-password/{email}', function ($email) {
    $user = Usuarios::where('correo', $email)->first();
    
    if (!$user) {
        return response()->json([
            'error' => 'Usuario no encontrado'
        ]);
    }
    
    $testPassword = '12345678';
    $user->contrasena = Hash::make($testPassword);
    $user->save();
    
    // Reload from database
    $user->refresh();
    
    return response()->json([
        'message' => 'Password set to: ' . $testPassword,
        'email' => $user->correo,
        'password_hash' => $user->contrasena,
        'verification' => Hash::check($testPassword, $user->contrasena)
    ]);
});
