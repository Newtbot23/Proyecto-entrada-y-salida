<!DOCTYPE html>
<html>
<head>
    <title>Reporte Detallado de Entidad</title>
    <style>
        body { font-family: sans-serif; }
        .section { margin-bottom: 20px; }
        .label { font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Reporte Detallado: {{ $entity->nombre_entidad }}</h1>
    
    <div class="section">
        <h3>Información General</h3>
        <p><span class="label">NIT:</span> {{ $entity->nit }}</p>
        <p><span class="label">Representante:</span> {{ $entity->nombre_titular }}</p>
        <p><span class="label">Correo:</span> {{ $entity->correo }}</p>
        <p><span class="label">Teléfono:</span> {{ $entity->telefono }}</p>
        <p><span class="label">Dirección:</span> {{ $entity->direccion }}</p>
        <p><span class="label">Fecha de Registro:</span> {{ $entity->created_at }}</p>
    </div>

    @if($entity->licencia)
    <div class="section">
        <h3>Licencia Actual</h3>
        <p><span class="label">Nombre:</span> {{ $entity->licencia->nombre }}</p>
        <p><span class="label">Descripción:</span> {{ $entity->licencia->descripcion }}</p>
    </div>
    @endif

    <div class="section">
        <h3>Usuarios Asociados ({{ $entity->usuarios->count() }})</h3>
        @if($entity->usuarios->count() > 0)
        <table>
            <thead>
                <tr>
                    <th>Doc</th>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Correo</th>
                    <th>Rol</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
                @foreach($entity->usuarios as $usuario)
                <tr>
                    <td>{{ $usuario->doc }}</td>
                    <td>{{ $usuario->primer_nombre }}</td>
                    <td>{{ $usuario->primer_apellido }}</td>
                    <td>{{ $usuario->correo }}</td>
                    <td>{{ $usuario->rol ? $usuario->rol->nombre : 'N/A' }}</td>
                    <td>{{ $usuario->estado }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @else
        <p>No hay usuarios registrados asociados a esta entidad.</p>
        @endif
    </div>
</body>
</html>
