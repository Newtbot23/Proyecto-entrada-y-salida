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
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Fecha Creación</th>
            </tr>
        </thead>
        <tbody>
            @foreach($licenses as $license)
            <tr>
                <td>{{ $license->id }}</td>
                <td>{{ $license->nombre }}</td>
                <td>{{ $license->descripcion }}</td>
                <td>{{ $license->created_at }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
