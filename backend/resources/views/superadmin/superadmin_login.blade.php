@if($errors->any())
    <div style="color:red">
        {{ $errors->first() }}
    </div>
@endif

<form method="POST" action="{{ route('superadmin.login.submit') }}">
    @csrf

    <label>Email</label><br>
    <input type="email" name="correo" required><br><br>

    <label>Contraseña</label><br>
    <input type="password" name="contrasena" required><br><br>

    <button type="submit">Ingresar</button>
</form>
