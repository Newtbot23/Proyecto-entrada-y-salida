<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Login</title>
</head>
<body>
    <div class="container">
        <h1>Iniciar sesión</h1>

        @if($errors->any())
            <div class="error-box">
                <ul>
                    @foreach($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        <form method="POST" action="{{ route('login.submit') }}">
            @csrf
            <div class="form-group">
                <label>Correo</label>
                <input type="email" name="correo" value="{{ old('correo') }}" required />
            </div>
            <div class="form-group">
                <label>Contraseña</label>
                <input type="password" name="contrasena" required />
            </div>
            <button type="submit">Entrar</button>
        </form>

        <div class="links">
            <a href="{{ url('usuario/forgot-password') }}">¿Olvidaste tu contraseña?</a>
        </div>
    </div>
</body>
</html>
