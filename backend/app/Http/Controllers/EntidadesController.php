<?php

namespace App\Http\Controllers;

use App\Models\Entidades;
use App\Models\LicenciasSistema;
use Illuminate\Http\Request;
use Carbon\Carbon;

class EntidadesController extends Controller
{
    public function index(Request $request)
    {
        $busqueda = $request->get('buscar');

        $institutions = Entidades::when($busqueda, function ($query, $busqueda) {
            $query->where('nombre_entidad', 'like', "%$busqueda%");
        })->paginate(5);

        return view('superadmin.institutions', compact('institutions', 'busqueda'));
    }

    public function dashboard()
    {
        $entidades = Entidades::with('licencia')->get();
        $institucionesActivas = Entidades::count();
        
        $fecha_limite = Carbon::now()->addDays(30);
        $licenciasProximasAVencer = LicenciasSistema::where('fecha_vencimiento', '<=', $fecha_limite)
            ->where('fecha_vencimiento', '>=', Carbon::now())
            ->count();
        
        return view('superadmin.superadmin', compact('entidades', 'institucionesActivas', 'licenciasProximasAVencer'));
    }

    public function create()
{
    return view('superadmin.institutions_create');
}

    public function store(Request $request)
    {
        $request->validate([
            'nombre_entidad' => 'required|string|max:200',
            'correo' => 'required|email',
            'direccion' => 'required|string',
            'nombre_titular' => 'required|string|max:200|regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/',
            'telefono' => 'required|regex:/^[0-9]{7,15}$/',
            'nit' => 'required|regex:/^[0-9]{6,15}$/'
        ]);

        Entidades::create($request->all());

        return redirect()->route('superadmin.institutions.index')
            ->with('success', 'Entidad creada correctamente');
    }

    public function edit($id)
    {
        $entidad = Entidades::findOrFail($id);
        return view('superadmin.institutions_edit', compact('entidad'));
    }

    public function update(Request $request, $id)
    {
        $entidad = Entidades::findOrFail($id);

        $request->validate([
            'nombre_entidad' => 'required|string|max:200',
            'correo' => 'required|email',
            'direccion' => 'required|string',
            'nombre_titular' => 'required|string|max:200|regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/',
            'telefono' => 'required|regex:/^[0-9]{7,15}$/',
            'nit' => 'required|regex:/^[0-9]{6,15}$/'
        ]);

        $entidad->update($request->all());

        return redirect()->route('superadmin.institutions.index')
            ->with('success', 'Entidad actualizada');
    }

    public function destroy($id)
    {
        Entidades::findOrFail($id)->delete();

        return redirect()->route('superadmin.institutions.index')
            ->with('success', 'Entidad eliminada');
    }
}
