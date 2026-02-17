<!DOCTYPE html>
<html>
<head>
    <title>Código de Recuperación</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <h2 style="color: #4A90E2; text-align: center;">Recuperación de Contraseña</h2>
        <p>Hola,</p>
        <p>Has solicitado restablecer tu contraseña. Utiliza el siguiente código de 6 dígitos para continuar con el proceso:</p>
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            {{ $code }}
        </div>
        <p>Este código es válido por 60 minutos.</p>
        <p>Si no has solicitado este cambio, puedes ignorar este correo.</p>
        <hr style="border: 0; border-top: 1px solid #ddd;">
        <p style="font-size: 12px; color: #777; text-align: center;">Este es un correo automático, por favor no responda.</p>
    </div>
</body>
</html>
