    @if($errors->any())
    <ul style="color:red">
        @foreach($errors->all() as $error)
            <li>{{ $error }}</li>
        @endforeach
    </ul>
@endif

<h2>Datos de Pago de Licencia</h2>

<p><strong>Entidad Registrada:</strong> {{ $entidad->nombre_entidad }}</p>
<p><strong>Plan Seleccionado:</strong> {{ $plan->nombre_plan }} - ${{ number_format($plan->precio_plan, 2) }}</p>

<form action="{{ route('superadmin.usuarios-pagos.store') }}" method="POST">
@csrf

<input type="hidden" name="entidad_id" value="{{ $entidad_id }}">
<input type="hidden" name="plan_id" value="{{ $plan_id }}">
<input type="hidden" name="licencia_id" value="{{ $licencia_id }}">

<h3>Información de Pago</h3>

<label>Precio del Plan</label><br>
<input type="text" value="${{ number_format($plan->precio_plan, 2) }}" readonly><br><br>

<label>Fecha de Pago</label><br>
<input type="date" name="fecha_pago" required><br><br>

<label>Método de pago</label><br>
<select name="metodo_pago" required>
    <option value="">-- Seleccionar Método de Pago --</option>
    <option value="efectivo">Efectivo</option>
    <option value="transferencia">Transferencia Bancaria</option>
    <option value="tarjeta">Tarjeta de Crédito/Débito</option>
</select><br><br>

<label>Referencia</label><br>
<input type="text" name="referencia" placeholder="Número de transacción o referencia" required><br><br>

<button type="submit">Registrar Pago de Licencia</button>
<a href="{{ route('superadmin.dashboard') }}">Cancelar</a>
</form>
