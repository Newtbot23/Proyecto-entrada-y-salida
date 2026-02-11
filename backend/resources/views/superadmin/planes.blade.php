
<table >
    <thead>
        <tr>
            <th>ID</th>
            <th>Nombre del plan</th>
            <th>Duración</th>
            <th>Características</th>
            <th>Precio</th>
            <th>Acciones</th>
        </tr>
    </thead>

    <tbody>
        @forelse ($planes as $plan)
            <tr>
                <td>{{ $plan->id }}</td>
                <td>{{ $plan->nombre_plan }}</td>
                <td>{{ $plan->duracion_plan }}</td>
                <td>{{ $plan->caracteristicas }}</td>
                <td>${{ $plan->precio_plan }}</td>
                <td>
                    <a href="{{ route('superadmin.planes.edit', $plan->id) }}">Editar</a>

                    <form action="{{ route('superadmin.planes.destroy', $plan->id) }}"
                        method="POST"
                        style="display:inline">
                        @csrf
                        @method('DELETE')
                        <button type="submit"
                                onclick="return confirm('¿Seguro que deseas eliminar este plan?')">
                            Eliminar
                        </button>
                    </form>
                </td>
            </tr>
        @empty
            <tr>
                <td colspan="6">No hay planes registrados</td>
            </tr>
        @endforelse
    </tbody>
</table>

<hr>

<h3>Crear nuevo plan</h3>

<form action="{{ route('superadmin.planes.store') }}" method="POST">
    @csrf

    <input type="text" name="nombre_plan" placeholder="Nombre del plan" required>
    <br>

    <textarea name="caracteristicas" placeholder="Características" required></textarea>
    <br>

    <input type="number" name="duracion_plan" min="0" required placeholder="Duración en meses">
    <br>

    <input type="number" name="precio_plan" step="0.01" required>
    <br>

    <button type="submit">Guardar</button>
</form>
