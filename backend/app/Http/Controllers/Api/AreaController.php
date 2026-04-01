<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Area;
use App\Models\Usuarios;
use Illuminate\Http\Request;

class AreaController extends Controller
{
    /**
     * List all areas with their user count.
     */
    public function index()
    {
        $areas = Area::withCount('usuarios')->orderBy('nombre')->get();
        return response()->json($areas);
    }

    /**
     * Create a new area.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre'      => 'required|string|max:100|unique:areas,nombre',
            'descripcion' => 'nullable|string|max:255',
        ]);

        $area = Area::create($request->only(['nombre', 'descripcion']));

        return response()->json([
            'success' => true,
            'message' => 'Área creada correctamente.',
            'area'    => $area,
        ], 201);
    }

    /**
     * Get users belonging to a specific area.
     */
    public function getUsuarios($id)
    {
        $area = Area::with('usuarios')->findOrFail($id);

        $usuarios = $area->usuarios->map(function ($u) {
            return [
                'doc'            => $u->doc,
                'primer_nombre'  => $u->primer_nombre,
                'segundo_nombre' => $u->segundo_nombre,
                'primer_apellido'=> $u->primer_apellido,
                'segundo_apellido'=> $u->segundo_apellido,
            ];
        });

        return response()->json($usuarios);
    }

    /**
     * Sync users to an area (replaces existing assignments).
     * Accepts an array of 'doc' values (user documents).
     */
    public function asignarUsuarios(Request $request, $id)
    {
        $request->validate([
            'usuarios'   => 'required|array',
            'usuarios.*' => 'integer|exists:usuarios,doc',
        ]);

        $area = Area::findOrFail($id);

        // sync() accepts an array of keys — here we use 'id_usuario' as the related key.
        // Because belongsToMany uses 'doc' as the foreign key on the usuarios side,
        // sync expects doc values directly.
        $area->usuarios()->sync($request->usuarios);

        return response()->json([
            'success' => true,
            'message' => 'Usuarios del área actualizados correctamente.',
            'total'   => count($request->usuarios),
        ]);
    }

    /**
     * Get all users who belong to ANY area, with area_name for badge display.
     * Used by FichasAssign to mark and sort admin users to the bottom.
     */
    public function getUsuariosAdministrativos()
    {
        $rows = \Illuminate\Support\Facades\DB::table('area_usuario as au')
            ->join('usuarios as u', 'u.doc', '=', 'au.id_usuario')
            ->join('areas as a', 'a.id', '=', 'au.id_area')
            ->select('u.doc', 'a.nombre as area_nombre')
            ->get()
            ->keyBy('doc');

        return response()->json($rows);
    }
}
