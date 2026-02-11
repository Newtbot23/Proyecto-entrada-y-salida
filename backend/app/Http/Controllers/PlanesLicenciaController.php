<?php

namespace App\Http\Controllers;

use App\Models\PlanesLicencia;
use Illuminate\Http\Request;

class PlanesLicenciaController extends Controller
{
    public function index()
    {
        $planes = PlanesLicencia::all();
        return view('superadmin.planes', compact('planes'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre_plan' => 'required|string|max:200',
            'caracteristicas' => 'required|string|max:1000',
            'duracion_plan' => 'required|integer|min:0',
            'precio_plan' => 'required|numeric|min:0'
        ]);

        PlanesLicencia::create($request->all());

        return redirect()->route('superadmin.planes.index')
            ->with('success', 'Plan registrado correctamente');
    }

    public function edit($id)
    {
        $plan = PlanesLicencia::findOrFail($id);
        return view('superadmin.planes_edit', compact('plan'));
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nombre_plan' => 'required|string|max:200',
            'caracteristicas' => 'required|string|max:1000',
            'duracion_plan' => 'required|integer|min:0',
            'precio_plan' => 'required|numeric|min:0',
            'estado' => 'nullable|in:activo,inactivo'
        ]);

        $plan = PlanesLicencia::findOrFail($id);
        $plan->update($request->all());

        return redirect()->route('superadmin.planes.index')
            ->with('success', 'Plan actualizado correctamente');
    }

    public function destroy($id)
    {
        $plan = PlanesLicencia::findOrFail($id);
        $plan->delete();

        return redirect()->route('superadmin.planes.index')
            ->with('success', 'Plan eliminado correctamente');
    }

    public function userPlanes()
{
    $planes = PlanesLicencia::all();

    return view('superadmin.planes_user', compact('planes'));
}

    
}


