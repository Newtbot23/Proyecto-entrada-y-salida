<!DOCTYPE html>
<html>
<head>
    <title>Reporte de Licencias</title>
    <style>
        body { font-family: sans-serif; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Reporte de Licencias del Sistema</h1>
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Fecha Inicio</th>
                <th>Fecha Vencimiento</th>
                <th>Estado</th>
                <th>Fecha Última Validación</th>
                <th>Plan</th>
                <th>Entidad</th>
                <th>Creado En</th>
                <th>Actualizado A Las</th>
            </tr>
        </thead>
        <tbody>
            @foreach($licenses as $license)
            <tr>
                <td>{{ $license->id }}</td>
                <td>{{ $license->fecha_inicio }}</td>
                <td>{{ $license->fecha_vencimiento }}</td>
                <td>{{ $license->estado }}</td>
                <td>{{ $license->fecha_ultima_validacion }}</td>
                <td>{{ $license->plan ? $license->plan->nombre_plan : 'N/A' }}</td>
                <td>{{ $license->entidad ? $license->entidad->nombre_entidad : 'N/A' }}</td>
                <td>{{ $license->created_at }}</td>
                <td>{{ $license->updated_at }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
