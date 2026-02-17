<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperar Contraseña</title>
</head>
<body>
    <div class="card">
        <div class="header">
            <h1>Recuperar contraseña</h1>
            <p>Ingresa tu correo electrónico para recibir un código de recuperación.</p>
        </div>

        <form action="{{ $type === 'superadmin' ? route('superadmin.forgot.submit') : route('usuario.forgot.submit') }}" method="POST">
            @csrf
            <input type="hidden" name="type" value="{{ $type }}">
            
            <div class="form-group">
                <label for="correo">Correo Electrónico</label>
                <input type="email" id="correo" name="correo" value="{{ old('correo') }}" required autofocus placeholder="tu@correo.com">
                @error('correo')
                    <div class="error-message">{{ $message }}</div>
                @enderror
            </div>

            <button type="submit" class="btn">Enviar Código</button>
        </form>

        <a href="{{ $type === 'superadmin' ? route('superadmin.login') : route('login') }}" class="back-link">
            Volver al inicio de sesión
        </a>
    </div>
</body>
</html>
