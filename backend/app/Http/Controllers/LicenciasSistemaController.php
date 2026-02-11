<?php

namespace App\Http\Controllers;

use App\Models\LicenciasSistema;
use Illuminate\Http\Request;

class LicenciasSistemaController extends Controller
{
    public function index()
    {
        $licencias = LicenciasSistema::all();
        return view('superadmin.licencias', compact('licencias'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'fecha_inicio' => 'required|date',
            'fecha_vencimiento' => 'required|date|after_or_equal:fecha_inicio',
            'estado' => 'nullable|boolean',
            'fecha_ultima_validacion' => 'nullable|date_format:Y-m-d H:i:s',
            'id_plan_lic' => 'required|exists:planes_licencia,id',
            'id_entidad' => 'required|exists:entidades,id',
        ]);

        LicenciasSistema::create($request->only([
            'fecha_inicio',
            'fecha_vencimiento',
            'estado',
            'fecha_ultima_validacion',
            'id_plan_lic',
            'id_entidad'
        ]));

        return redirect()->back()->with('success', 'Licencia creada correctamente');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'fecha_inicio' => 'required|date',
            'fecha_vencimiento' => 'required|date|after_or_equal:fecha_inicio',
            'estado' => 'nullable|boolean',
            'fecha_ultima_validacion' => 'nullable|date_format:Y-m-d H:i:s',
            'id_plan_lic' => 'required|exists:planes_licencia,id',
            'id_entidad' => 'required|exists:entidades,id',
        ]);

        $licencia = LicenciasSistema::findOrFail($id);
        $licencia->update($request->only([
            'fecha_inicio',
            'fecha_vencimiento',
            'estado',
            'fecha_ultima_validacion',
            'id_plan_lic',
            'id_entidad'
        ]));

        return redirect()->back()->with('success', 'Licencia actualizada correctamente');
    }

    public function destroy($id)
    {
        $licencia = LicenciasSistema::findOrFail($id);
        $licencia->delete();
        return redirect()->back()->with('success', 'Licencia eliminada correctamente');
    }
}
