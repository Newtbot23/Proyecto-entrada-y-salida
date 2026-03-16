<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Equipos;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

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
            $equipo = Equipos::create($data);
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
        // "Opción Nuclear" para forzar respuesta JSON
        $request->headers->set('Accept', 'application/json');

        try {
            // Validación relajada para evitar errores MIME de Excel
            $request->validate([
                'archivo' => 'required|file',
                'lote_importacion' => 'required|string|max:255|unique:equipos,lote_importacion'
            ]);

            $file = $request->file('archivo');

            // Validación manual de extensión
            $extension = strtolower($file->getClientOriginalExtension());
            if ($extension !== 'csv') {
                return response()->json(['success' => false, 'message' => 'El archivo debe ser un CSV válido.'], 422);
            }

            $handle = fopen($file->getRealPath(), 'r');
            $header = fgetcsv($handle);

            if (!$header) {
                fclose($handle);
                return response()->json(['success' => false, 'message' => 'El archivo está vacío o no tiene cabeceras.'], 400);
            }

            $loteId = $request->input('lote_importacion');
            $importedCount = 0;
            $rowNumber = 1;

            DB::beginTransaction();

            while (($row = fgetcsv($handle)) !== false) {
                $rowNumber++;

                // Validar estructura mínima de la fila
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

                // Autogeneración de serial para Herramientas/Otros
                if (empty($serial) && in_array($categoria, ['Herramientas', 'Otros'])) {
                    $serial = "GEN-IMP-" . Auth::id() . "-" . now()->timestamp . bin2hex(random_bytes(2));
                }

                // Mapeo seguro de Marcas
                $idMarca = null;
                if (!empty($marcaNombre)) {
                    $marca = DB::table('marcas_equipo')->where('marca', $marcaNombre)->first();
                    $idMarca = $marca ? $marca->id : null;
                }

                // Mapeo seguro de Sistemas Operativos
                $idSo = null;
                if (!empty($soNombre)) {
                    $os = DB::table('sistemas_operativos')->where('sistema_operativo', $soNombre)->first();
                    $idSo = $os ? $os->id : null;
                }

                Equipos::create([
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
                    'lote_importacion' => $loteId,
                ]);

                $importedCount++;
            }

            DB::commit();
            fclose($handle);

            return response()->json([
                'success' => true,
                'message' => "Se importaron {$importedCount} equipos correctamente.",
                'data' => ['count' => $importedCount]
            ]);
        } catch (\Throwable $th) {
            DB::rollBack();
            if (isset($handle) && is_resource($handle)) fclose($handle);

            return response()->json([
                'success' => false,
                'message' => 'Error en la importación: ' . $th->getMessage(),
                'line' => $th->getLine()
            ], 500);
        }
    }

    /**
     * Get unique batches with equipment counts.
     */
    public function getLotes()
    {
        $lotes = DB::table('equipos')
            ->select('lote_importacion', DB::raw('count(*) as total'))
            ->whereNotNull('lote_importacion')
            ->groupBy('lote_importacion')
            ->get();

        return response()->json($lotes);
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
            'nuevo_lote' => 'nullable|string|max:255'
        ]);

        $equipo = Equipos::findOrFail($id);
        $equipo->update(['lote_importacion' => $request->nuevo_lote]);

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
        $lote = $request->query('lote'); // Puede ser un nombre de lote o null/string 'null'

        $query = DB::table('equipos')
            ->leftJoin('marcas_equipo', 'equipos.id_marca', '=', 'marcas_equipo.id')
            ->select('equipos.*', 'marcas_equipo.marca');

        if ($lote === 'sin_lote' || $lote === null) {
            $query->whereNull('lote_importacion');
        } else {
            $query->where('lote_importacion', $lote);
        }

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
