<!DOCTYPE html>
<html>
<head>
    <title>Reporte General de Entidades</title>
    <style>
        body { font-family: sans-serif; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Reporte General de Entidades</h1>
    <table>
        <thead>
            <tr>
                <th>NIT</th>
                <th>Nombre Entidad</th>
                <th>Representante</th>
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
</body>
</html>
