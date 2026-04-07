<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Equipo;
use App\Models\Lote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class EquipoController extends Controller
{
    /**
     * Store a newly created equipment in storage.
     */
    public function store(Request $request)
    {
        $rules = [
            'categoria_equipo' => 'required|in:Computo,Electronica,Herramientas,Otros',
            'tipo_equipo' => 'required|in:sena,propio',
            'placa_sena' => 'nullable|string|max:50',
            'id_marca' => 'required_if:categoria_equipo,Computo,Electronica|exists:marcas_equipo,id',
            'estado' => 'required|in:asignado,no_asignado,inhabilitado',
            'modelo' => 'required|string|max:100',
            'tipo_equipo_desc' => 'required|string|max:200',
            'caracteristicas' => 'required|string',
            'id_sistema_operativo' => 'required_if:categoria_equipo,Computo,Electronica|exists:sistemas_operativos,id',
            'img_serial' => 'nullable|string', // Assuming it's a path or URL string
        ];

        // Serial is mandatory for Computo and Electronica
        if (in_array($request->categoria_equipo, ['Computo', 'Electronica'])) {
            $rules['serial'] = 'required|string|max:100|unique:equipos,serial';
        } else {
            $rules['serial'] = 'nullable|string|max:100|unique:equipos,serial';
        }

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        // Automatic PK generation if serial is empty
        if (empty($data['serial'])) {
            $userId = Auth::id();
            $timestamp = now()->timestamp;
            $data['serial'] = "GEN-USR-{$userId}-{$timestamp}";
        }

        try {
            $equipo = Equipo::create($data);
            return response()->json([
                'message' => 'Equipo registrado exitosamente',
                'equipo' => $equipo
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al registrar el equipo', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Import equipment from CSV.
     */
    public function importarCsv(Request $request)
    {
        $request->headers->set('Accept', 'application/json');

        try {
            // Strict MIME type validation
            $request->validate([
                'archivo' => 'required|file|mimes:csv,txt',
                'lote_descripcion' => 'nullable|string|max:255'
            ]);

            $file = $request->file('archivo');

            $handle = fopen($file->getRealPath(), 'r');
            $header = fgetcsv($handle);

            if (!$header) {
                fclose($handle);
                return response()->json(['success' => false, 'message' => 'El archivo está vacío o no tiene cabeceras.'], 400);
            }

            $importedCount = 0;

            DB::beginTransaction();

            // 1. Create the Lote record
            $lote = Lote::create([
                'codigo_lote' => 'LOTE-' . now()->format('Ymd') . '-' . strtoupper(Str::random(4)),
                'descripcion' => $request->lote_descripcion ?? 'Importación masiva: ' . $file->getClientOriginalName(),
                'fecha_importacion' => now()
            ]);

            while (($row = fgetcsv($handle)) !== false) {
                if (count($row) < 5) continue;

                $serial = trim($row[0] ?? '');
                $categoria = trim($row[1] ?? '');
                $placaSena = trim($row[2] ?? '');
                $marcaNombre = trim($row[3] ?? '');
                $modelo = trim($row[4] ?? '');
                $soNombre = trim($row[5] ?? '');
                $desc = trim($row[6] ?? '');
                $caract = trim($row[7] ?? '');

                if (empty($categoria) || empty($modelo) || empty($desc)) continue;

                if (empty($serial) && in_array($categoria, ['Herramientas', 'Otros'])) {
                    $serial = "GEN-IMP-" . Auth::id() . "-" . now()->timestamp . bin2hex(random_bytes(2));
                }

                $idMarca = $marcaNombre ? DB::table('marcas_equipo')->where('marca', $marcaNombre)->value('id') : null;
                $idSo = $soNombre ? DB::table('sistemas_operativos')->where('sistema_operativo', $soNombre)->value('id') : null;

                Equipo::create([
                    'serial' => $serial,
                    'categoria_equipo' => $categoria,
                    'tipo_equipo' => 'sena',
                    'placa_sena' => $placaSena,
                    'id_marca' => $idMarca,
                    'estado' => 'no_asignado',
                    'modelo' => $modelo,
                    'tipo_equipo_desc' => $desc,
                    'caracteristicas' => $caract ?: 'Importado masivamente',
                    'id_sistema_operativo' => $idSo,
                    'id_lote' => $lote->id,
                    'estado_aprobacion' => 'activo',
                ]);

                $importedCount++;
            }

            DB::commit();
            fclose($handle);

            return response()->json([
                'success' => true,
                'message' => "Se importaron {$importedCount} equipos correctamente.",
                'lote' => $lote
            ]);
        } catch (\Throwable $th) {
            DB::rollBack();
            if (isset($handle) && is_resource($handle)) fclose($handle);

            return response()->json([
                'success' => false,
                'message' => 'Error en la importación: ' . $th->getMessage()
            ], 500);
        }
    }

    /**
     * Get unique batches with equipment counts and their linked ambiente.
     */
    public function getLotes()
    {
        $lotes = Lote::withCount('equipos')->with('ambiente')->get();
        return response()->json($lotes);
    }

    /**
     * Update a Lote's linked ambiente.
     */
    public function updateLote(Request $request, $id)
    {
        $request->validate([
            'id_ambiente' => 'nullable|string|exists:ambientes,numero_ambiente',
            'descripcion' => 'nullable|string|max:255',
        ]);

        $lote = Lote::findOrFail($id);
        $lote->update($request->only(['id_ambiente', 'descripcion']));

        return response()->json([
            'success' => true,
            'message' => 'Lote actualizado correctamente.',
            'lote'    => $lote->load('ambiente')
        ]);
    }

    /**
     * Rename an entire batch.
     */
    public function renombrarLote(Request $request)
    {
        $request->validate([
            'nombre_actual' => 'required|string',
            'nuevo_nombre' => 'required|string|max:255|unique:equipos,lote_importacion'
        ]);

        $affected = DB::table('equipos')
            ->where('lote_importacion', $request->nombre_actual)
            ->update(['lote_importacion' => $request->nuevo_nombre]);

        return response()->json([
            'success' => true,
            'message' => "Lote renombrado. {$affected} equipos actualizados.",
            'nuevo_nombre' => $request->nuevo_nombre
        ]);
    }

    /**
     * Move a single equipment to another batch.
     */
    public function moverEquipoLote(Request $request, $id)
    {
        $request->validate([
            'nuevo_lote' => 'nullable|exists:lotes,id'
        ]);

        $equipo = Equipo::findOrFail($id);
        $equipo->update(['id_lote' => $request->nuevo_lote]);

        return response()->json([
            'success' => true,
            'message' => 'Equipo movido de lote correctamente.',
            'equipo' => $equipo
        ]);
    }

    /**
     * Get equipment filtered by batch name or those without batch.
     */
    public function getEquiposByLote(Request $request)
    {
        $loteId = $request->query('id_lote');

        $query = Equipo::with(['lote', 'marca', 'sistema_operativo']);

        if ($loteId === 'sin_lote' || $loteId === null) {
            $query->whereNull('id_lote');
        } else {
            $query->where('id_lote', $loteId);
        }

        // Excluir equipos marcados como propios
        $query->where('tipo_equipo', '!=', 'propio');

        return response()->json($query->get());
    }

    /**
     * Get catalogs for equipment registration.
     */
    public function getCatalogs()
    {
        return response()->json([
            'marcas' => DB::table('marcas_equipo')->get(),
            'sistemas_operativos' => DB::table('sistemas_operativos')->get(),
        ]);
    }
}
