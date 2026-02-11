<form method="GET" action="{{ route('superadmin.institutions.index') }}">
    <input type="search" name="buscar" value="{{ $busqueda ?? '' }}" placeholder="Search">
    <button type="submit">Buscar</button>
</form>

<a href="{{ route('superadmin.institutions.create') }}" type="submit">Crear entidad</a>
<table border="1">
    <thead>
        <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Dirección</th>
            <th>Titular</th>
            <th>Teléfono</th>
            <th>Estado</th>
            <th>NIT</th>
            <th>Acciones</th>
        </tr>
    </thead>

    <tbody>
        @forelse ($institutions as $entidad)
            <tr>
                <td>{{ $entidad->nombre_entidad }}</td>
                <td>{{ $entidad->correo }}</td>
                <td>{{ $entidad->direccion }}</td>
                <td>{{ $entidad->nombre_titular }}</td>
                <td>{{ $entidad->telefono }}</td>
                <td>{{ $entidad->estado }}</td>
                <td>{{ $entidad->nit }}</td>
                <td>
                    <a href="{{ route('superadmin.institutions.edit', $entidad->id) }}">Edit</a>

                    <form action="{{ route('superadmin.institutions.destroy', $entidad->id) }}"
                        method="POST" style="display:inline">
                        @csrf
                        @method('DELETE')
                        <button type="submit">Delete</button>
                    </form>
                </td>
            </tr>
        @empty
            <tr>
                <td colspan="7">No hay instituciones</td>
            </tr>
        @endforelse
    </tbody>
</table>

{{ $institutions->withQueryString()->links() }}
