<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Recuperar Contraseña</title>
<<<<<<< HEAD
    
=======
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 400px;
        }
        h1 {
            text-align: center;
            color: #333;
            margin-top: 0;
        }
        .info {
            background: #e7f3ff;
            border-left: 4px solid #2196F3;
            padding: 10px;
            margin-bottom: 20px;
            border-radius: 4px;
            font-size: 14px;
            color: #0c5aa0;
        }
        @if($errors->any())
        .error {
            background: #ffebee;
            border-left: 4px solid #f44336;
            padding: 10px;
            margin-bottom: 20px;
            border-radius: 4px;
            font-size: 14px;
            color: #c62828;
        }
        @endif
        form {
            display: flex;
            flex-direction: column;
        }
        label {
            margin-top: 15px;
            margin-bottom: 5px;
            color: #333;
            font-weight: bold;
        }
        input {
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }
        input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 5px rgba(102, 126, 234, 0.3);
        }
        button {
            margin-top: 20px;
            padding: 12px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: background 0.3s;
        }
        button:hover {
            background: #5568d3;
        }
        .links {
            margin-top: 20px;
            text-align: center;
            font-size: 14px;
        }
        .links a {
            color: #667eea;
            text-decoration: none;
            margin: 0 10px;
        }
        .links a:hover {
            text-decoration: underline;
        }
    </style>
>>>>>>> f7279cf115aac816eb29840fd090ad998a6251a8
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

        <form method="POST" action="{{ url('usuario/forgot-password') }}">
            @csrf

            <label for="correo">Correo Electrónico</label>
            <input type="email" id="correo" name="correo" value="{{ old('correo') }}" required>

            <button type="submit">Enviar Enlace de Recuperación</button>
        </form>

        <div class="links">
            <a href="{{ route('login') }}">← Volver al login</a>
        </div>
    </div>
</body>
</html>
