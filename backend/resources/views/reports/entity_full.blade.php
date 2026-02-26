<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reporte de Entidad Completo</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; color: #333; }
        .section { margin-bottom: 20px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
        h2 { text-align: center; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 5px; }
        h3 { color: #34495e; border-bottom: 1px solid #eee; padding-bottom: 3px;}
        table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px; }
        th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
        th { background-color: #f8f9fa; font-weight: bold; width: 30%; }
        .users-table th { background-color: #e9ecef; width: auto; }
        .footer { margin-top: 30px; text-align: right; font-size: 10px; color: #666; border-top: 1px solid #ddd; padding-top: 5px;}
    </style>
</head>
<body>
    <h2>Reporte Detallado Escolar / Corporativo</h2>
    <p>Fecha de generación: {{ date('Y-m-d H:i:s') }}</p>

    <div class="section">
        <h3>1. Información de la Entidad</h3>
        <table>
            <tr><th>NIT</th><td>{{ $entity->nit }}</td></tr>
            <tr><th>Nombre de la Entidad</th><td>{{ $entity->nombre_entidad }}</td></tr>
            <tr><th>Representante Legal</th><td>{{ $entity->nombre_titular }}</td></tr>
            <tr><th>Correo Electrónico</th><td>{{ $entity->correo }}</td></tr>
            <tr><th>Teléfono de Contacto</th><td>{{ $entity->telefono }}</td></tr>
            <tr><th>Dirección Físico</th><td>{{ $entity->direccion }}</td></tr>
            <tr><th>Fecha de Registro</th><td>{{ $entity->created_at ? $entity->created_at->format('Y-m-d') : 'N/A' }}</td></tr>
        </table>
    </div>

    <div class="section">
        <h3>2. Estado de Licencia</h3>
        @if($entity->licencia)
            <table>
                <tr><th>ID Licencia</th><td>{{ $entity->licencia->id }}</td></tr>
                <tr><th>Estado</th><td><strong>{{ strtoupper($entity->licencia->estado) }}</strong></td></tr>
                <tr><th>Fecha de Inicio</th><td>{{ $entity->licencia->fecha_inicio }}</td></tr>
                <tr><th>Fecha de Vencimiento</th><td>{{ $entity->licencia->fecha_vencimiento }}</td></tr>
                <tr><th>Referencia de Pago</th><td>{{ $entity->licencia->referencia_pago ?? 'No registrada' }}</td></tr>
            </table>
        @else
            <p style="color:red; font-weight:bold;">No se encontró una licencia registrada o activa para esta entidad.</p>
        @endif
    </div>

    <div class="section">
        <h3>3. Usuarios Asociados ({{ $entity->usuarios ? count($entity->usuarios) : 0 }})</h3>
        @if($entity->usuarios && count($entity->usuarios) > 0)
            <table class="users-table">
                <thead>
                    <tr>
                        <th>Documento</th>
                        <th>Nombres</th>
                        <th>Apellidos</th>
                        <th>Rol</th>
                        <th>Correo</th>
                        <th>Teléfono</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($entity->usuarios as $user)
                    <tr>
                        <td>{{ $user->doc }}</td>
                        <td>{{ $user->primer_nombre }} {{ $user->segundo_nombre }}</td>
                        <td>{{ $user->primer_apellido }} {{ $user->segundo_apellido }}</td>
                        <td>{{ $user->rol->nombre_rol ?? 'Usuario' }}</td>
                        <td>{{ $user->correo }}</td>
                        <td>{{ $user->telefono }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <p>No hay usuarios registrados bajo esta entidad.</p>
        @endif
    </div>

    <div class="footer">
        Generado automáticamente por el Sistema de Entradas y Salidas - Módulo de Reportes
    </div>
</body>
</html>
