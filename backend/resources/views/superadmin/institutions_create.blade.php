<h3>Registro de entidades</h3>

<form action="{{ route('superadmin.institutions.store') }}" method="POST">
    @csrf

    <input type="text" name="nombre_entidad" placeholder="Nombre de la entidad" required>
    <br>

    <input type="email" name="correo" placeholder="ingrese su correo" required>
    <br>

    <input type="text" name="direccion" required>
    <br>

    <input type="text" name="nombre_titular" required>
    <br>

    <input type="number" name="telefono" required>
    <br>

    <input type="number" name="nit" required>
    <br>

    <button type="submit">Crear entidad</button>
</form>
