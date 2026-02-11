<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Login</title>
</head>
<body>
    <h1>Iniciar sesión</h1>

    @if($errors->any())
        <div style="color:red;">
            <ul>
                @foreach($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <form method="POST" action="{{ route('login.submit') }}">
        @csrf
        <div>
            <label>Correo</label>
            <input type="email" name="correo" value="{{ old('correo') }}" required />
        </div>
        <div>
            <label>Contraseña</label>
            <input type="password" name="contrasena" required />
        </div>
        <div>
            <button type="submit">Entrar</button>
        </div>
    </form>

</body>
</html>
