<table>
    <thead>
        <tr>
            <th>Nombre de la Entidad</th>
            <th>Estado Licencia</th>
            <th>Fecha Expiración</th>
            <th>Acciones</th>
        </tr>
    </thead>
    <tbody>
        @foreach($entidades as $entidad)
            <tr>
                <td>{{ $entidad->nombre_entidad ?? $entidad->nombre ?? '—' }}</td>
                <td>{{ $entidad->licencia->estado ?? '—' }}</td>
                <td>{{ optional($entidad->licencia)->fecha_vencimiento ? \Carbon\Carbon::parse($entidad->licencia->fecha_vencimiento)->format('Y-m-d') : '—' }}</td>
                <td>
                    <a href="{{ route('superadmin.institutions.edit', $entidad->id) }}">Editar</a>
                </td>
            </tr>
        @endforeach
    </tbody>
</table>
