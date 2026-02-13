<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Login - Administrador</title>
</head>
<body>
    <div class="container">
        <div class="admin-badge">Panel del superAdministrador</div>
        <h1>Iniciar sesión</h1>

        @if($errors->any())
            <div class="error-box">
                {{ $errors->first() }}
            </div>
        @endif

        <form method="POST" action="{{ route('superadmin.login.submit') }}">
            @csrf

            <div class="form-group">
                <label for="correo">Email</label>
                <input type="email" id="correo" name="correo" value="{{ old('correo') }}" required>
            </div>

            <div class="form-group">
                <label for="contrasena">Contraseña</label>
                <input type="password" id="contrasena" name="contrasena" required>
            </div>

            <button type="submit">Ingresar</button>
        </form>

        <div class="links">
            <a href="{{ url('superadmin/admin/forgot-password') }}" class="forgot-password-link">¿Olvidaste tu contraseña?</a>
        </div>
    </div>
</body>
</html>
