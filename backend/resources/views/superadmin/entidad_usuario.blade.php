@if($errors->any())
    <ul style="color:red">
        @foreach($errors->all() as $error)
            <li>{{ $error }}</li>
        @endforeach
    </ul>
@endif

<form action="{{ route('superadmin.entidad-usuario.store') }}" method="POST" enctype="multipart/form-data">
@csrf

<input type="hidden" name="plan_id" value="{{ $plan_id }}">

<h3>Datos de la Entidad</h3>

<input type="text" name="nombre_entidad" placeholder="Nombre entidad" required><br>
<input type="email" name="correo_entidad" placeholder="Correo entidad" required><br>
<input type="text" name="direccion" placeholder="Dirección" required><br>
<input type="text" name="nombre_titular" placeholder="Nombre titular" required><br>
<input type="text" name="telefono_entidad" placeholder="Teléfono entidad" required><br>
<input type="text" name="nit" placeholder="NIT" required><br>

<hr>

<h3>Datos del Usuario</h3>

<select name="id_tip_doc" required>
    <option value="">Tipo documento</option>
    @foreach($tiposDoc as $tipo)
        <option value="{{ $tipo->id_tip_doc }}">{{ $tipo->nombre }}</option>
    @endforeach
</select><br>

<input type="text" name="doc" placeholder="Documento" required><br>
<input type="text" name="primer_nombre" placeholder="Primer nombre" pattern="[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+" title="Solo se permiten letras y espacios" required><br>
<input type="text" name="segundo_nombre" placeholder="Segundo nombre" pattern="[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+" title="Solo se permiten letras y espacios"><br>
<input type="text" name="primer_apellido" placeholder="Primer apellido" pattern="[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+" title="Solo se permiten letras y espacios" required><br>
<input type="text" name="segundo_apellido" placeholder="Segundo apellido" pattern="[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+" title="Solo se permiten letras y espacios"><br>
<input type="text" name="telefono_usuario" placeholder="Teléfono usuario" pattern="[0-9]{7,15}" title="Solo números (7 a 15 dígitos)" required><br>
<input type="email" name="correo_usuario" placeholder="Correo usuario" required><br>
<input type="file" name="imagen"><br>
<input type="password" name="contrasena" placeholder="Contraseña" required><br>

<select name="id_rol" required>
    <option value="">Rol</option>
    @foreach($roles as $rol)
        <option value="{{ $rol->id }}">{{ $rol->rol }}</option>
    @endforeach
</select>

<br><br>

<button type="submit">Registrar Entidad y Usuario</button>
</form>

