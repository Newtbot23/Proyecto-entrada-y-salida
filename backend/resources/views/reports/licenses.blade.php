<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reporte de Licencias</title>
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
    <h2>Reporte de Licencias del Sistema</h2>
    <p>Fecha de generación: {{ date('Y-m-d H:i:s') }}</p>

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Entidad</th>
                <th>Plan</th>
                <th>Estado</th>
                <th>F. Inicio</th>
                <th>F. Vencimiento</th>
                <th>Referencia</th>
            </tr>
        </thead>
        <tbody>
            @foreach($licenses as $license)
            <tr>
                <td>{{ $license->id }}</td>
                <td>{{ $license->entidad->nombre_entidad ?? 'N/A' }}</td>
                <td>{{ $license->plan->nombre_plan ?? 'N/A' }}</td>
                <td>{{ ucfirst($license->estado) }}</td>
                <td>{{ $license->fecha_inicio }}</td>
                <td>{{ $license->fecha_vencimiento }}</td>
                <td>{{ $license->referencia_pago ?? 'Ninguna' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        Generado automáticamente por el Sistema de Entradas y Salidas
    </div>
</body>
</html>
