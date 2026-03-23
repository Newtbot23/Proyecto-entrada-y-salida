<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use App\Models\Vehiculos;
use App\Models\Equipos;
use App\Models\Asignaciones;
use App\Models\TiposVehiculo;
use App\Models\MarcasEquipo;
use App\Models\SistemasOperativos;
use App\Http\Requests\Api\Vehiculos\StoreVehiculoRequest;
use App\Http\Requests\Api\Equipos\StoreEquipoRequest;
use App\Http\Requests\Api\UserDashboard\OCRImageRequest;
use App\Services\GoogleVisionService;

class UserDashboardController extends Controller
{
    protected $visionService;

    public function __construct(GoogleVisionService $visionService)
    {
        $this->visionService = $visionService;
    }
    public function getCatalogs()
    {
        $tiposVehiculo = TiposVehiculo::select('id', 'tipo_vehiculo')->get();
        $marcasEquipo = MarcasEquipo::select('id', 'marca')->get();
        $sistemasOperativos = SistemasOperativos::select('id', 'sistema_operativo')->get();

        return response()->json([
            'success' => true,
            'data' => [
                'tipos_vehiculo' => $tiposVehiculo,
                'marcas_equipo' => $marcasEquipo,
                'sistemas_operativos' => $sistemasOperativos
            ]
        ]);
    }

    public function getVehiculos(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'No autenticado'], 401);
        }

        $vehiculos = Vehiculos::with('tipo_vehiculo')
            ->where('doc', $user->doc)
            ->orderBy('es_predeterminado', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $vehiculos
        ]);
    }

    public function getEquipos(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'No autenticado'], 401);
        }

        $equipos = Asignaciones::with(['equipo.marca', 'equipo.sistema_operativo'])
            ->where('doc', $user->doc)
            ->whereHas('equipo')
            ->get()
            ->map(function ($asignacion) {
                $equipo = $asignacion->equipo;
                return (object) array_merge((array) $equipo->toArray(), [
                    'marca' => $equipo->marca->marca ?? null,
                    'so' => $equipo->sistema_operativo->sistema_operativo ?? null,
                    'es_predeterminado' => $asignacion->es_predeterminado
                ]);
            })
            ->unique('serial')
            ->values();

        return response()->json([
            'success' => true,
            'data' => $equipos
        ]);
    }

    public function getEntradas(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'No autenticado'], 401);
        }

        $query = \App\Models\Registros::where('doc', $user->doc);

        if ($request->has('fecha') && !empty($request->fecha)) {
            $query->whereDate('fecha', $request->fecha);
        } else {
            // Default to last 5 entries if no date filter is provided
            $query->limit(5);
        }

        $entradas = $query
            ->with(['equipos_registrados.equipo.marca', 'vehiculo'])
            ->orderBy('fecha', 'desc')
            ->orderBy('hora_entrada', 'desc')
            ->get()
            ->map(function($r) {
                return [
                    'id' => $r->id,
                    'fecha' => $r->fecha,
                    'hora_entrada' => $r->hora_entrada,
                    'hora_salida' => $r->hora_salida,
                    'placa' => $r->placa,
                    'vehiculo_marca' => $r->vehiculo->marca ?? null,
                    'vehiculo_modelo' => $r->vehiculo->modelo ?? null,
                    'vehiculo_color' => $r->vehiculo->color ?? null,
                    'equipos' => $r->equipos_registrados->map(function($re) {
                        return [
                            'serial' => $re->serial_equipo,
                            'modelo' => $re->equipo->modelo ?? 'N/A',
                            'marca' => $re->equipo->marca->marca ?? 'N/A'
                        ];
                    })
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $entradas
        ]);
    }

    public function readPlate(OCRImageRequest $request)
    {
        try {
            $imagePath = $request->file('image')->getPathname();
            $base64Image = base64_encode(file_get_contents($imagePath));

            $placa = $this->visionService->parsePlate($base64Image);

            if ($placa) {
                return response()->json([
                    'success' => true,
                    'placa' => $placa,
                    'message' => 'Placa detectada con éxito'
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'No se pudo detectar la placa en la imagen'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al procesar la imagen con Google Vision',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function readSerial(OCRImageRequest $request)
    {
        try {
            $imagePath = $request->file('image')->getPathname();
            $base64Image = base64_encode(file_get_contents($imagePath));

            $result = $this->visionService->parseSerial($base64Image);

            if ($result) {
                return response()->json([
                    'success' => true,
                    'extracted_serial' => $result['serial'],
                    'raw_text' => $result['raw_text'],
                    'message' => 'Texto extraído exitosamente'
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'No se pudo extraer texto de la imagen'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al procesar la imagen con Google Vision',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function storeVehiculo(StoreVehiculoRequest $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'No autenticado'], 401);
        }

        try {
            $pathGeneral = null;
            $pathDetalle = null;

            if ($request->hasFile('foto_general')) {
                $pathGeneral = $request->file('foto_general')->store('vehiculos', 'public');
            }
            if ($request->hasFile('foto_detalle')) {
                $pathDetalle = $request->file('foto_detalle')->store('vehiculos', 'public');
            }

            // Concatenar rutas con pipe |
            $rutaFinal = $pathGeneral;
            if ($pathDetalle) {
                $rutaFinal = $rutaGeneral = $pathGeneral ? $pathGeneral . '|' . $pathDetalle : $pathDetalle;
            }

            Vehiculos::create([
                'placa' => strtoupper($request->placa),
                'id_tipo_vehiculo' => $request->id_tipo_vehiculo,
                'doc' => $user->doc,
                'marca' => $request->marca,
                'modelo' => $request->modelo,
                'color' => $request->color,
                'descripcion' => $request->descripcion ?? '',
                'img_vehiculo' => $rutaFinal,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Vehículo registrado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar vehículo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function storeEquipo(StoreEquipoRequest $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'No autenticado'], 401);
        }

        try {
            $pathGeneral = null;
            $pathDetalle = null;

            if ($request->hasFile('foto_general')) {
                $pathGeneral = $request->file('foto_general')->store('equipos', 'public');
            }
            if ($request->hasFile('foto_detalle')) {
                $pathDetalle = $request->file('foto_detalle')->store('equipos', 'public');
            }

            // Concatenar rutas con pipe |
            $rutaFinal = $pathGeneral;
            if ($pathDetalle) {
                $rutaFinal = $pathGeneral ? $pathGeneral . '|' . $pathDetalle : $pathDetalle;
            }

            Equipos::create([
                'serial' => $request->serial,
                'tipo_equipo' => 'propio',
                'placa_sena' => 'N/A', // Placa sena defaults to N/A for propio
                'id_marca' => $request->id_marca,
                'estado' => 'no_asignado',
                'estado_aprobacion' => 'pendiente',
                'modelo' => $request->modelo,
                'tipo_equipo_desc' => $request->tipo_equipo_desc,
                'caracteristicas' => $request->caracteristicas ?? '',
                'id_sistema_operativo' => $request->id_sistema_operativo,
                'img_serial' => $rutaFinal,
            ]);

            Asignaciones::create([
                'doc' => $user->doc,
                'serial_equipo' => $request->serial,
                'numero_ambiente' => null,
                'estado' => 1,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Equipo registrado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar equipo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function toggleEstado(Request $request, $tipo, $id)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'No autenticado'], 401);
        }

        try {
            if ($tipo === 'vehiculo') {
                $item = Vehiculos::where('placa', $id)
                    ->where('doc', $user->doc)
                    ->first();

                if (!$item) {
                    return response()->json(['success' => false, 'message' => 'Vehículo no encontrado'], 404);
                }

                $nuevoEstado = $item->estado_aprobacion === 'activo' ? 'inactivo' : 'pendiente';

                $item->update(['estado_aprobacion' => $nuevoEstado]);

            } elseif ($tipo === 'equipo') {
                // Para equipos, validamos que el usuario tenga la asignación
                $item = Equipos::where('serial', $id)
                    ->whereHas('asignaciones', function($q) use ($user) {
                        $q->where('doc', $user->doc);
                    })
                    ->first();

                if (!$item) {
                    return response()->json(['success' => false, 'message' => 'Equipo no encontrado'], 404);
                }

                $nuevoEstado = $item->estado_aprobacion === 'activo' ? 'inactivo' : 'pendiente';

                $item->update(['estado_aprobacion' => $nuevoEstado]);
            } else {
                return response()->json(['success' => false, 'message' => 'Tipo de activo no válido'], 400);
            }

            return response()->json([
                'success' => true,
                'message' => 'Estado actualizado correctamente',
                'nuevo_estado' => $nuevoEstado
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el estado',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function setDefaultAsset(Request $request, $tipo, $id)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'No autenticado'], 401);
        }

        try {
            DB::beginTransaction();

            if ($tipo === 'vehiculo') {
                // Check ownership
                $item = Vehiculos::where('placa', $id)
                    ->where('doc', $user->doc)
                    ->first();

                if (!$item) {
                    return response()->json(['success' => false, 'message' => 'Vehículo no encontrado o no pertenece al usuario'], 404);
                }

                // Reset all for this user
                Vehiculos::where('doc', $user->doc)
                    ->update(['es_predeterminado' => 0]);

                // Set new default
                $item->update(['es_predeterminado' => 1]);

            } elseif ($tipo === 'equipo') {
                // Check ownership in asignaciones
                $item = Asignaciones::where('serial_equipo', $id)
                    ->where('doc', $user->doc)
                    ->first();

                if (!$item) {
                    return response()->json(['success' => false, 'message' => 'Equipo no encontrado o no asignado al usuario'], 404);
                }

                // Reset all for this user
                Asignaciones::where('doc', $user->doc)
                    ->update(['es_predeterminado' => 0]);

                // Set new default
                $item->update(['es_predeterminado' => 1]);

            } else {
                return response()->json(['success' => false, 'message' => 'Tipo de activo no válido'], 400);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Activo predeterminado actualizado con éxito'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al establecer el activo predeterminado',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function checkActiveSession(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'No autenticado'], 401);
        }

        $registroActivo = \App\Models\Registros::where('doc', $user->doc)
            ->whereNull('hora_salida')
            ->orderBy('fecha', 'desc')
            ->orderBy('hora_entrada', 'desc')
            ->first();

        if (!$registroActivo) {
            return response()->json([
                'warning' => false
            ]);
        }

        try {
            $entrada = \Carbon\Carbon::parse($registroActivo->fecha . ' ' . $registroActivo->hora_entrada);
            $ahora = \Carbon\Carbon::now();
            
            // Calculamos la diferencia en minutos y la pasamos a horas decimales
            $minutosTranscurridos = $ahora->diffInMinutes($entrada);
            $totalHoras = abs($minutosTranscurridos) / 60;

            return response()->json([
                'warning' => $totalHoras > 6.5,
                'horas_transcurridas' => round($totalHoras, 1)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'warning' => false,
                'message' => 'Error al calcular tiempo de sesión'
            ]);
        }
    }
}
