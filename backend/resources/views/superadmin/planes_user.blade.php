<div class="planes-container">
    @forelse ($planes as $plan)
        <div class="plan-card">
            <p>ID: {{ $plan->id }}</p>
            <h2>{{ $plan->nombre_plan }}</h2>
            
            <h3>Duración</h3>
            <p>{{ $plan->duracion_plan }} {{ $plan->duracion_plan == 1 ? 'Mes' : 'Meses' }}</p>
            
            <h3>Características</h3>
            <p>{{ $plan->caracteristicas }}</p>
            
            <h3>Precio</h3>
            <p>${{ number_format($plan->precio_plan, 2) }}</p>

            <a href="{{ route('superadmin.entidad-usuario.create', $plan->id) }}">
                <button type="button">Adquirir plan</button>
            </a>
        </div>
        <hr>
    @empty
        <p>No hay planes por el momento.</p>
    @endforelse
</div>