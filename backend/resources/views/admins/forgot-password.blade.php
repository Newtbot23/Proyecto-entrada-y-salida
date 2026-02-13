<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Recuperar Contraseña - Administrador</title>
</head>
<body>
    <div class="container">
        <h1>Recuperar Contraseña</h1>

        <div class="info">
            Ingresa tu correo electrónico y recibirás un enlace para recuperar tu contraseña.
        </div>

        @if($errors->any())
            <div class="error">
                <ul style="margin: 0; padding-left: 20px;">
                    @foreach($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        <form method="POST" action="{{ url('superadmin/admin/forgot-password') }}">
            @csrf

            <label for="correo">Correo Electrónico</label>
            <input type="email" id="correo" name="correo" value="{{ old('correo') }}" required>

            <button type="submit">Enviar Enlace de Recuperación</button>
        </form>

        <div class="links">
            <a href="{{ route('superadmin.login') }}">← Volver al login</a>
        </div>
    </div>
</body>
</html>
