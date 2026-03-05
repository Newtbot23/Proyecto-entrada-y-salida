<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reporte de Entidades</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f4f4f4; }
        h2 { text-align: center; color: #333; }
        .footer { margin-top: 30px; text-align: right; font-size: 10px; color: #666; }
    </style>
</head>
<body>
    <h2>Reporte General de Entidades Registradas</h2>
    <p>Fecha de generación: {{ date('Y-m-d H:i:s') }}</p>

    <table>
        <thead>
            <tr>
                <th>NIT</th>
                <th>Nombre Entidad</th>
                <th>Representante Legal</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Dirección</th>
            </tr>
        </thead>
        <tbody>
            @foreach($entities as $entity)
            <tr>
                <td>{{ $entity->nit }}</td>
                <td>{{ $entity->nombre_entidad }}</td>
                <td>{{ $entity->nombre_titular }}</td>
                <td>{{ $entity->correo }}</td>
                <td>{{ $entity->telefono }}</td>
                <td>{{ $entity->direccion }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        Generado automáticamente por el Sistema de Entradas y Salidas
    </div>
</body>
</html>
