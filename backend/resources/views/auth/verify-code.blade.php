<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verificar Código</title>
</head>
<body>
    <div class="card">
        <div class="header">
            <h1>Verificar Código</h1>
            <p>Hemos enviado un código de 6 dígitos a <strong>{{ $email }}</strong>.</p>
        </div>

        <form action="{{ $type === 'superadmin' ? route('superadmin.verify.submit') : route('verify.submit') }}" method="POST">
            @csrf
            <input type="hidden" name="type" value="{{ $type }}">
            <input type="hidden" name="email" value="{{ $email }}">
            
            <div class="form-group">
                <label for="code">Código de 6 dígitos</label>
                <input type="text" id="code" name="code" maxlength="6" pattern="\d{6}" required autofocus placeholder="000000">
                @error('code')
                    <div class="error-message">{{ $message }}</div>
                @enderror
            </div>

            <button type="submit" class="btn">Verificar</button>
        </form>

        <a href="{{ $type === 'superadmin' ? route('superadmin.forgot.form') : route('forgot.form') }}" class="back-link">
            No recibí el código
        </a>
    </div>
</body>
</html>
