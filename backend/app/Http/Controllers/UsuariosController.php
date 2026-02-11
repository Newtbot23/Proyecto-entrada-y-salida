<?php

namespace App\Http\Controllers;

use App\Models\Usuarios;
use App\Models\Roles;
use App\Models\Entidades;
use App\Models\TipoDoc;
use App\Models\LicenciasSistema;
use App\Models\PlanesLicencia;
use App\Models\PagosLicencia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class UsuariosController extends Controller
{
    public function createEntidadUsuario($plan = null)
    {
        $tiposDoc = TipoDoc::all();
        $roles = Roles::all();
        $plan_id = $plan;

        return view('superadmin.entidad_usuario', [
            'tiposDoc' => $tiposDoc,
            'roles' => $roles,
            'plan_id' => $plan_id,
        ]);
    }

    public function storeEntidadUsuario(Request $request)
    {
        $request->validate([
            'nombre_entidad' => 'required|string|max:200',
            'correo_entidad' => 'required|email',
            'direccion' => 'required|string',
            'nombre_titular' => 'required|string|max:100',
            'telefono_entidad' => 'required|string|max:15',
            'nit' => 'required|string|max:15|unique:entidades,nit',
            'id_tip_doc' => 'required|exists:tipo_doc,id_tip_doc',
            'doc' => 'required|string|max:20|unique:usuarios,doc',
            'primer_nombre' => 'required|string|max:50',
            'primer_apellido' => 'required|string|max:50',
            'telefono_usuario' => 'required|string|max:13',
            'correo_usuario' => 'required|email|unique:usuarios,correo',
            'contrasena' => 'required|min:6',
            'id_rol' => 'required|exists:roles,id',
            'estado' => 'nullable|in:activo,inactivo',
            'plan_id' => 'required|exists:planes_licencia,id',
        ]);

        $transactionResult = DB::transaction(function () use ($request) {
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

            // Create License Immediately via Plan
            $plan = PlanesLicencia::findOrFail($request->plan_id);
            $fecha_inicio = Carbon::now();
            $fecha_vencimiento = $fecha_inicio->copy()->addDays(intval($plan->duracion_plan));

            $licencia = LicenciasSistema::create([
                'id_plan_lic' => $plan->id,
                'id_entidad' => $entidad->id,
                'fecha_inicio' => $fecha_inicio->toDateString(),
                'fecha_vencimiento' => $fecha_vencimiento->toDateString(),
                'estado' => 'pendiente', // Default pending until payment details
                'fecha_ultima_validacion' => now(),
            ]);

            Usuarios::create([
                'id_tip_doc' => $request->id_tip_doc,
                'doc' => $request->doc,
                'primer_nombre' => $request->primer_nombre,
                'segundo_nombre' => $request->input('segundo_nombre', ''),
                'primer_apellido' => $request->primer_apellido,
                'segundo_apellido' => $request->input('segundo_apellido', ''),
                'telefono' => $request->telefono_usuario,
                'correo' => $request->correo_usuario,
                'imagen' => $rutaImagen,
                'contrasena' => Hash::make($request->contrasena),
                'id_rol' => $request->id_rol,
                'estado' => $request->input('estado', 'activo'),
                'id_licencia_sistema' => $licencia->id,
            ]);

            return ['entidad' => $entidad, 'licencia' => $licencia];
        });

        // Redirect with license info if needed, or just entity/plan
        // storeUsuariosPagos will need to know which license to update or create payment for.
        // But the legacy route expects 'entidad' and 'plan'.
        // We can pass 'licencia_id' in session or query param if we update the route/controller.
        // For now, let's stick to the flow but we need to ensure storeUsuariosPagos finds the license.

        return redirect()->route('superadmin.usuarios-pagos.create', [
            'entidad' => $transactionResult['entidad']->id,
            'plan' => $request->plan_id,
            'licencia_id' => $transactionResult['licencia']->id // Pass this
        ])->with('success', 'Entidad, Licencia y Usuario registrados. Complete los datos de pago.');
    }

    public function createUsuariosPagos(Request $request, $entidad, $plan)
    {
        $entidadData = Entidades::findOrFail($entidad);
        $planData = PlanesLicencia::findOrFail($plan);
        $licenciaId = $request->query('licencia_id'); // Get from query param

        return view('superadmin.usuarios_create', [
            'entidad' => $entidadData,
            'plan' => $planData,
            'entidad_id' => $entidad,
            'plan_id' => $plan,
            'licencia_id' => $licenciaId,
        ]);
    }

    public function storeUsuariosPagos(Request $request)
    {
        $request->validate([
            'entidad_id' => 'required|exists:entidades,id',
            'plan_id' => 'required|exists:planes_licencia,id',
            'licencia_id' => 'required|exists:licencias_sistema,id', // Make it required now
            'fecha_pago' => 'required|date',
            'metodo_pago' => 'required|in:efectivo,transferencia,tarjeta',
            'referencia' => 'required|string|max:100',
        ]);

        DB::transaction(function () use ($request) {
            $licencia = LicenciasSistema::findOrFail($request->licencia_id);
            
            // Payment logic is separate from License creation now.
            // But we can update license status to active if payment is recorded by SuperAdmin.
            if ($licencia->estado === 'pendiente') {
                $licencia->update([
                    'estado' => 'activo', // SuperAdmin manual entry implies approval
                    'fecha_ultima_validacion' => Carbon::now()->toDateTimeString(),
                    'id_plan_lic' => $request->plan_id, // Ensure plan matches
                ]);
            }

            PagosLicencia::create([
                'id_licencia' => $licencia->id,
                'fecha_pago' => Carbon::parse($request->fecha_pago)->toDateTimeString(),
                'metodo_pago' => $request->metodo_pago,
                'referencia' => $request->referencia,
                'estado' => 'completado', // Auto-complete for SuperAdmin entry
                'creado_en' => Carbon::now()->toDateTimeString(),
            ]);
        });

        return redirect()->route('superadmin.dashboard')
            ->with('success', 'Todos los datos registrados correctamente');
    }
}
