<!DOCTYPE html>
<html>
<head>
    <title>Código de Recuperación</title>
    <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; }
        .header { text-align: center; margin-bottom: 30px; }
        .code-box { background-color: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #008f39; margin: 20px 0; }
        .footer { font-size: 12px; color: #666; margin-top: 30px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Recuperación de Contraseña</h2>
        </div>
        
        <p>Hola,</p>
        <p>Has solicitado restablecer tu contraseña. Utiliza el siguiente código de 6 dígitos para continuar con el proceso:</p>
        
        <div class="code-box">
            {{ $code }}
        </div>
        
        <p>Este código expirará en 60 minutos por razones de seguridad.</p>
        <p>Si no has solicitado este cambio, puedes ignorar este correo de forma segura.</p>
        
        <div class="footer">
            <p>&copy; {{ date('Y') }} Control de Entradas y Salidas. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>
