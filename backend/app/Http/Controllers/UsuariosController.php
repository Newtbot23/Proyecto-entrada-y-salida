<?php

namespace App\Http\Controllers;

use App\Models\Usuarios;
use App\Models\Roles;
use App\Models\Entidades;
use App\Models\TipoDoc;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UsuariosController extends Controller
{
    public function createEntidadUsuario()
    {
        $tiposDoc = TipoDoc::all();
        $roles = Roles::all();

        return view('superadmin.entidad_usuario', compact('tiposDoc', 'roles'));
    }

    public function storeEntidadUsuario(Request $request)
{
    $request->validate([
        // ENTIDAD
        'nombre_entidad' => 'required|string|max:200',
        'correo_entidad' => 'required|email',
        'direccion' => 'required|string',
        'nombre_titular' => 'required|string|max:100',
        'telefono_entidad' => 'required|string|max:15',
        'nit' => 'required|string|max:15|unique:entidades,nit',

        // USUARIO
        'id_tip_doc' => 'required|exists:tipo_doc,id_tip_doc',
        'doc' => 'required|string|max:20|unique:usuarios,doc',
        'primer_nombre' => 'required|string|max:50',
        'primer_apellido' => 'required|string|max:50',
        'telefono_usuario' => 'required|string|max:13',
        'correo_usuario' => 'required|email|unique:usuarios,correo',
        'contrasena' => 'required|min:6',
        'id_rol' => 'required|exists:roles,id',
    ]);

    DB::transaction(function () use ($request) {

        $entidad = Entidades::create([
            'nombre_entidad' => $request->nombre_entidad,
            'correo' => $request->correo_entidad,
            'direccion' => $request->direccion,
            'nombre_titular' => $request->nombre_titular,
            'telefono' => $request->telefono_entidad,
            'nit' => $request->nit,
        ]);

        $rutaImagen = null;
        if ($request->hasFile('imagen')) {
            $rutaImagen = $request->file('imagen')->store('usuarios', 'public');
        }

        Usuarios::create([
            'id_tip_doc' => $request->id_tip_doc,
            'doc' => $request->doc,
            'primer_nombre' => $request->primer_nombre,
            'segundo_nombre' => $request->segundo_nombre,
            'primer_apellido' => $request->primer_apellido,
            'segundo_apellido' => $request->segundo_apellido,
            'telefono' => $request->telefono_usuario,
            'correo' => $request->correo_usuario,
            'imagen' => $rutaImagen,
            'contrasena' => Hash::make($request->contrasena),
            'id_rol' => $request->id_rol,
            'id_entidad' => $entidad->id,
        ]);
    });

    return redirect()->back()->with('success', 'Entidad y usuario creados correctamente');
}
}
