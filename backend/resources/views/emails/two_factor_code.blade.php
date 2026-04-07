<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Autenticación de Seguridad</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #fafafa;
            color: #333333;
            margin: 0;
            padding: 0;
        }
        .wrapper {
            width: 100%;
            background-color: #fafafa;
            padding: 40px 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            padding: 40px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .title {
            text-align: center;
            color: #008f39;
            font-size: 22px;
            font-weight: bold;
            margin-bottom: 30px;
            margin-top: 0;
        }
        .text {
            font-size: 15px;
            line-height: 1.6;
            color: #333333;
            margin-bottom: 20px;
        }
        .code-container {
            background-color: #f4f5f7;
            border-radius: 4px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
        }
        .code {
            font-size: 32px;
            font-weight: bold;
            color: #2c3e50;
            letter-spacing: 12px;
            margin: 0;
            padding-left: 12px; /* To correctly center considering letter-spacing */
        }
        .footer {
            margin-top: 40px;
            font-size: 13px;
            color: #888888;
            border-top: 1px solid #eeeeee;
            padding-top: 20px;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <h1 class="title">Autenticación de Seguridad</h1>
            
            <p class="text">Hola,</p>
            
            <p class="text">Por favor utiliza el siguiente código de 6 dígitos para completar el inicio de sesión en el sistema.</p>
            
            <div class="code-container">
                <p class="code">{{ $code }}</p>
            </div>

            <p class="text">Este código expirará pronto. Si no estabas intentando ingresar al sistema indicaría un problema de seguridad, por favor avisa de inmediato.</p>
            
            <div class="footer">
                <p>Este es un mensaje automático, por favor no respondas a este correo.</p>
            </div>
        </div>
    </div>
</body>
</html>
