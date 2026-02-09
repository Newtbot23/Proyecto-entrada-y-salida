@if(session('success'))
    <div style="color:green">{{ session('success') }}</div>
@endif
@if(session('error'))
    <div style="color:red">{{ session('error') }}</div>
@endif
@if($errors->any())
    <div style="color:red">
        <ul>
            @foreach($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
@endif

<form action="{{ route('superadmin.usuarios.store') }}" method="POST" enctype="multipart/form-data">
    @csrf

    <label>Tipo de documento</label><br>
    <select name="id_tip_doc" required>
        <option value="">Seleccione</option>
        @foreach ($tiposDoc as $tipo)
            <option value="{{ $tipo->id_tip_doc }}">
                {{ $tipo->nombre }}
            </option>
        @endforeach
    </select>
    <br><br>

    <label>Documento</label><br>
    <input type="number" name="doc" required><br><br>

    <label>Primer nombre</label><br>
    <input type="text" name="primer_nombre" required><br><br>

    <label>Segundo nombre</label><br>
    <input type="text" name="segundo_nombre"><br><br>

    <label>Primer apellido</label><br>
    <input type="text" name="primer_apellido" required><br><br>

    <label>Segundo apellido</label><br>
    <input type="text" name="segundo_apellido"><br><br>

    <label>Teléfono</label><br>
    <input type="text" name="telefono" required><br><br>

    <label>Correo</label><br>
    <input type="email" name="correo" required><br><br>

    <label>Imagen</label><br>
    <input type="file" name="imagen"><br><br>

    <label>Código QR</label><br>
    <input type="text" name="codigo_qr" ><br><br>

    <label>Contraseña</label><br>
    <input type="password" name="contrasena" required><br><br>

    <label>Rol</label><br>
<select name="id_rol" required>
    <option value="">Seleccione</option>
    @foreach ($roles as $rol)
        <option value="{{ $rol->id }}">
            {{ $rol->rol }}
        </option>
    @endforeach
</select>
<br><br>

    <label>Entidad</label><br>
    <select name="id_entidad" required>
        <option value="">Seleccione</option>
        @foreach ($entidades as $entidad)
            <option value="{{ $entidad->id }}">
                {{ $entidad->nombre_entidad }}
            </option>
        @endforeach
    </select>
    <br><br>

    <button type="submit">Registrar</button>
</form>
