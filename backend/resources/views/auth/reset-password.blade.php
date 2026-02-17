<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nueva Contraseña</title>
</head>
<body>
    <div class="card">
        <div class="header">
            <h1>Nueva Contraseña</h1>
            <p>Por favor, ingresa tu nueva contraseña para el correo <strong>{{ $email }}</strong>.</p>
        </div>

        <form action="{{ $type === 'superadmin' ? route('superadmin.reset.submit') : route('reset.submit') }}" method="POST">
            @csrf
            
            <div class="form-group">
                <label for="contrasena">Nueva Contraseña</label>
                <input type="password" id="contrasena" name="contrasena" required autofocus placeholder="********">
                @error('contrasena')
                    <div class="error-message">{{ $message }}</div>
                @enderror
            </div>

            <div class="form-group">
                <label for="contrasena_confirmation">Confirmar Contraseña</label>
                <input type="password" id="contrasena_confirmation" name="contrasena_confirmation" required placeholder="********">
            </div>

            <button type="submit" class="btn">Restablecer Contraseña</button>
        </form>
    </div>
</body>
</html>
