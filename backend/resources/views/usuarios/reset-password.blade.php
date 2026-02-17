<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Cambiar Contraseña</title>
    
</head>
<body>
    <div class="container">
        <h1>Cambiar Contraseña</h1>

        <div class="info">
            ✓ Ingresa tu nueva contraseña para recuperar el acceso a tu cuenta.
        </div>

        <form method="POST" action="/usuario/reset-password">
            @csrf

            <input type="hidden" name="token" value="{{ request()->route('token') }}">

            <div class="form-group">
                <label for="email">Correo Electrónico</label>
                <input type="email" id="email" name="email" value="{{ request()->email }}" required>
            </div>

            <div class="form-group">
                <label for="password">Nueva Contraseña</label>
                <input type="password" id="password" name="password" required>
            </div>

            <div class="form-group">
                <label for="password_confirmation">Confirmar Contraseña</label>
                <input type="password" id="password_confirmation" name="password_confirmation" required>
            </div>

            <button type="submit">Cambiar Contraseña</button>
        </form>

        <div class="links">
            <a href="{{ route('login') }}">← Volver al login</a>
        </div>
    </div>
</body>
</html>
