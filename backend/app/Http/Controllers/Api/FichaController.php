<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Fichas;
use App\Models\DetalleFichaUsuarios;
use App\Models\Usuarios;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class FichaController extends Controller
{
    public function getCatalogs()
    {
        try {
            $programas = DB::table('programas')->select('id', 'programa')->get();
            $ambientes = DB::table('ambientes')->select('numero_ambiente', 'ambiente')->get();
            $jornadas = DB::table('jornadas')->select('id', 'jornada')->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'programas' => $programas,
                    'ambientes' => $ambientes,
                    'jornadas' => $jornadas
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener catálogos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getFichasSinUsuarios()
    {
        try {
            // Traer TODAS las fichas ordenadas: primero las vacías, luego por número
            $fichas = Fichas::with('programa:id,programa')
                ->withCount('usuarios')
                ->orderBy('usuarios_count', 'asc')
                ->orderBy('numero_ficha', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $fichas
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener lista de fichas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getUsuariosAsignables(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado'
                ], 401);
            }
            
            $nitEntidad = $user->nit_entidad;

            // 1. Usuarios que son 'aprendiz' en fichas NO finalizadas
            // Estos son los únicos que tienen exclusividad total
            $aprendicesOcupados = DB::table('detalle_ficha_usuarios')
                ->join('fichas', 'detalle_ficha_usuarios.id_ficha', '=', 'fichas.id')
                ->where('fichas.estado', '!=', 'finalizada')
                ->where('detalle_ficha_usuarios.tipo_participante', 'aprendiz')
                ->pluck('detalle_ficha_usuarios.doc');

            // 2. Traemos a los disponibles de la entidad actual
            // Incluimos a los que no tienen ficha y a los que tienen ficha como instructor
            $usuarios = Usuarios::where('id_rol', 2)
                ->where('nit_entidad', $nitEntidad)
                ->whereNotIn('doc', $aprendicesOcupados)
                ->with(['fichas' => function($q) {
                    $q->where('estado', '!=', 'finalizada');
                }])
                ->get();

            // 3. Mapear respuesta e inyectar flag de instructor previo
            $usuariosFinales = $usuarios->map(function ($u) {
                // Si tiene alguna ficha activa, ya sabemos por el filtro anterior que es instructor
                $esInstructorPrevio = $u->fichas->count() > 0;

                return [
                    'doc' => $u->doc,
                    'primer_nombre' => $u->primer_nombre,
                    'segundo_nombre' => $u->segundo_nombre,
                    'primer_apellido' => $u->primer_apellido,
                    'segundo_apellido' => $u->segundo_apellido,
                    'es_instructor_previo' => $esInstructorPrevio
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $usuariosFinales
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener usuarios asignables: ' . $e->getMessage()
            ], 500);
        }
    }

    public function index()
    {
        try {
            $fichas = Fichas::with(['programa:id,programa', 'ambiente:numero_ambiente,ambiente', 'jornada:id,jornada'])
                ->withCount('usuarios')
                ->orderByRaw("FIELD(estado, 'lectiva', 'productiva', 'finalizada')")
                ->get();

            return response()->json([
                'success' => true,
                'data' => $fichas
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al listar fichas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $request->validate([
            'numero_ficha' => 'required|integer|unique:fichas,numero_ficha',
            'id_programa' => 'required|string|exists:programas,id',
            'numero_ambiente' => 'required|string|exists:ambientes,numero_ambiente',
            'id_jornada' => 'required|integer|exists:jornadas,id'
        ]);

        try {
            $ficha = Fichas::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Ficha creada exitosamente',
                'data' => $ficha
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear ficha',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getUsuarios($id)
    {
        try {
            $ficha = Fichas::findOrFail($id);
            $usuarios = $ficha->usuarios()->get();

            return response()->json([
                'success' => true,
                'data' => $usuarios
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener usuarios de la ficha',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function asignarUsuarios(Request $request, $id)
    {
        $request->validate([
            'usuarios'   => 'present|array',
            'usuarios.*' => 'integer|exists:usuarios,doc'
        ]);

        try {
            $ficha = Fichas::findOrFail($id);
            
            // Paso A: Obtener roles actuales para preservarlos
            $rolesActuales = DB::table('detalle_ficha_usuarios')
                ->where('id_ficha', $id)
                ->pluck('tipo_participante', 'doc')
                ->toArray();

            // Paso B: Construir el array asociativo para el sync
            $datosSincronizacion = [];
            foreach ($request->usuarios as $doc) {
                // Si el usuario ya existe, mantenemos su rol. Si es nuevo, es 'aprendiz'.
                $rol = $rolesActuales[$doc] ?? 'aprendiz';
                $datosSincronizacion[$doc] = ['tipo_participante' => $rol];
            }

            // Paso C: Ejecutar la sincronización
            $ficha->usuarios()->sync($datosSincronizacion);

            return response()->json([
                'success' => true,
                'message' => count($request->usuarios) > 0 
                    ? 'Usuarios asignados exitosamente' 
                    : 'La ficha ha sido vaciada correctamente',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al asignar usuarios',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function actualizarRolParticipante(Request $request, $detalle_id)
    {
        $request->validate([
            'tipo_participante' => 'required|string|in:aprendiz,instructor'
        ]);

        try {
            $detalle = DetalleFichaUsuarios::findOrFail($detalle_id);

            $detalle->update([
                'tipo_participante' => $request->tipo_participante
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Detalle actualizado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar detalle',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function actualizarRolPorFichaYUsuario(Request $request, $id_ficha, $doc)
    {
        $request->validate([
            'tipo_participante' => 'required|string|in:aprendiz,instructor'
        ]);

        try {
            $detalle = DetalleFichaUsuarios::where('id_ficha', $id_ficha)
                ->where('doc', $doc)
                ->firstOrFail();

            $detalle->update([
                'tipo_participante' => $request->tipo_participante
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Rol actualizado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar rol',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function buscarPorNumero($numero)
    {
        try {
            $ficha = Fichas::where('numero_ficha', $numero)
                ->with('programa:id,programa')
                ->first();

            if (!$ficha) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ficha no encontrada'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $ficha
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al buscar ficha',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getUsuariosDeFicha($id)
    {
        try {
            $ficha = Fichas::findOrFail($id);

            // Obtenemos los usuarios con los datos del pivote para conocer el rol (aprendiz/instructor)
            $usuarios = $ficha->usuarios()
                ->select(
                    'usuarios.doc', 
                    'primer_nombre', 
                    'segundo_nombre', 
                    'primer_apellido', 
                    'segundo_apellido',
                    'detalle_ficha_usuarios.tipo_participante',
                    'detalle_ficha_usuarios.id as detalle_id'
                )
                ->get();

            return response()->json([
                'success' => true,
                'data' => $usuarios
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener usuarios de la ficha',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function cambiarEstado(Request $request, $id) {
        $request->merge(['estado' => strtolower($request->estado)]);
        $request->validate(['estado' => 'required|in:lectiva,productiva,finalizada']);
        
        try {
            $ficha = Fichas::findOrFail($id);
            $ficha->update(['estado' => $request->estado]);

            return response()->json([
                'success' => true,
                'message' => 'Estado actualizado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el estado',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Devuelve la asistencia de todos los aprendices de una ficha para un mes y año.
     * Optimizado para evitar N+1 con Eager Loading restringido.
     */
    public function getAsistenciaMensual(Request $request, $fichaId)
    {
        try {
            $user = $request->user();
            $mes = $request->query('mes', Carbon::now()->month);
            $anio = $request->query('anio', Carbon::now()->year);

            // 1. VALIDACIÓN DE SEGURIDAD: ¿Es el usuario instructor de esta ficha?
            $esInstructor = DetalleFichaUsuarios::where('id_ficha', $fichaId)
                ->where('doc', $user->doc)
                ->where('tipo_participante', 'instructor')
                ->exists();

            if (!$esInstructor) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permisos para ver la asistencia de esta ficha.'
                ], 403);
            }

            // 2. CONSULTA OPTIMIZADA (Eager Loading Constrained)
            // Traemos la ficha con sus aprendices y SUS registros filtrados por mes/año
            $ficha = Fichas::with(['usuarios' => function ($query) use ($mes, $anio) {
                $query->where('detalle_ficha_usuarios.tipo_participante', 'aprendiz')
                    ->select('usuarios.doc', 'primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido')
                    ->with(['registros' => function ($regQuery) use ($mes, $anio) {
                        $regQuery->whereMonth('fecha', $mes)
                                 ->whereYear('fecha', $anio)
                                 ->select('doc', 'fecha', 'hora_entrada', 'hora_salida');
                    }]);
            }])->findOrFail($fichaId);

            // 3. ESTRUCTURAR RESPUESTA PARA FRONTEND
            $data = [
                'success' => true,
                'ficha' => [
                    'id' => $ficha->id,
                    'numero_ficha' => $ficha->numero_ficha,
                    'hora_limite_llegada' => $ficha->hora_limite_llegada
                ],
                'aprendices' => $ficha->usuarios->map(function ($aprendiz) {
                    return [
                        'doc' => $aprendiz->doc,
                        'nombres' => trim($aprendiz->primer_nombre . ' ' . $aprendiz->segundo_nombre),
                        'apellidos' => trim($aprendiz->primer_apellido . ' ' . $aprendiz->segundo_apellido),
                        'registros' => $aprendiz->registros
                    ];
                })
            ];

            return response()->json($data);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener asistencia mensual',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function desvincularUsuario($id, $doc)
    {
        try {
            $detalle = DetalleFichaUsuarios::where('id_ficha', $id)
                ->where('doc', $doc)
                ->firstOrFail();

            // Validación de Seguridad: No se puede desvincular a un instructor directamente
            if ($detalle->tipo_participante === 'instructor') {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede remover a un instructor activo. Cámbiele el rol a aprendiz primero en Gestión de Usuarios.'
                ], 403);
            }

            $detalle->delete();

            return response()->json([
                'success' => true,
                'message' => 'Usuario desvinculado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al desvincular usuario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateHoraLimite(Request $request, $id)
    {
        $request->validate([
            'hora_limite_llegada' => 'required|date_format:H:i'
        ]);

        try {
            $ficha = Fichas::findOrFail($id);
            $ficha->update([
                'hora_limite_llegada' => $request->hora_limite_llegada
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Hora límite actualizada'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar hora límite',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getInstructorAsistenciaBase(Request $request)
    {
        try {
            $user = $request->user();
            
            // Buscar la ficha donde el usuario es instructor
            $detalle = DetalleFichaUsuarios::where('doc', $user->doc)
                ->where('tipo_participante', 'instructor')
                ->first();

            if (!$detalle) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes una ficha asignada como instructor'
                ], 404);
            }

            $ficha = Fichas::with('programa:id,programa')->find($detalle->id_ficha);

            return response()->json([
                'success' => true,
                'data' => [
                    'id_ficha'            => $ficha->id,
                    'numero_ficha'        => $ficha->numero_ficha,
                    'hora_limite_llegada' => $ficha->hora_limite_llegada ?? '07:15',
                    'nombre_programa'     => $ficha->programa->programa ?? null,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener datos básicos de asistencia',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getInstructorAsistenciaMensual(Request $request)
    {
        try {
            $user = $request->user();
            $mes = $request->query('mes', Carbon::now()->month);
            $anio = $request->query('anio', Carbon::now()->year);

            // 1. IDENTIFICAR LA FICHA DEL INSTRUCTOR
            $detalleInstructor = DetalleFichaUsuarios::where('doc', $user->doc)
                ->where('tipo_participante', 'instructor')
                ->first();

            if (!$detalleInstructor) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes una ficha asignada como instructor.'
                ], 403);
            }

            $fichaId = $detalleInstructor->id_ficha;

            // 2. CONSULTA OPTIMIZADA (Eager Loading Constrained)
            // Traemos la ficha con sus aprendices y SUS registros filtrados por mes/año
            $ficha = Fichas::with(['usuarios' => function ($query) use ($mes, $anio) {
                $query->where('detalle_ficha_usuarios.tipo_participante', 'aprendiz')
                    ->select('usuarios.doc', 'primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido', 'imagen')
                    ->with(['registros' => function ($regQuery) use ($mes, $anio) {
                        $regQuery->whereMonth('fecha', $mes)
                                 ->whereYear('fecha', $anio)
                                 ->select('doc', 'fecha', 'hora_entrada', 'hora_salida');
                    }]);
            }])->findOrFail($fichaId);

            // 3. ESTRUCTURAR RESPUESTA PARA FRONTEND
            $data = [
                'success' => true,
                'ficha' => [
                    'id' => $ficha->id,
                    'numero_ficha' => $ficha->numero_ficha,
                    'hora_limite_llegada' => $ficha->hora_limite_llegada
                ],
                'aprendices' => $ficha->usuarios->map(function ($aprendiz) {
                    return [
                        'doc' => $aprendiz->doc,
                        'nombres' => trim($aprendiz->primer_nombre . ' ' . ($aprendiz->segundo_nombre ?? '')),
                        'apellidos' => trim($aprendiz->primer_apellido . ' ' . ($aprendiz->segundo_apellido ?? '')),
                        'foto_perfil' => $aprendiz->imagen ? asset('storage/' . $aprendiz->imagen) : null,
                        'registros_del_mes' => $aprendiz->registros
                    ];
                })
            ];

            return response()->json($data);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener asistencia mensual del instructor',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
