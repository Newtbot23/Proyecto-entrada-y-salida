<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Fichas;
use App\Models\DetalleFichaUsuarios;
use App\Models\Usuarios;
use App\Models\Programas;
use App\Models\Ambientes;
use App\Models\Jornadas;
use App\Models\Asignaciones;
use App\Models\Entidades;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class FichaController extends Controller
{
    public function getCatalogs()
    {
        try {
            $programas = Programas::select('id', 'programa')->get();
            $ambientes = Ambientes::select('numero_ambiente', 'ambiente')->get();
            $jornadas = Jornadas::select('id', 'jornada')->get();

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
            $aprendicesOcupados = DetalleFichaUsuarios::whereHas('ficha', function($q) {
                $q->where('estado', '!=', 'finalizada');
            })
            ->where('tipo_participante', 'aprendiz')
            ->pluck('doc');

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
            $rolesActuales = DetalleFichaUsuarios::where('id_ficha', $id)
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

            // REGLA DE NEGOCIO: Solo un instructor por ficha
            if ($request->tipo_participante === 'instructor') {
                $existeInstructor = DetalleFichaUsuarios::where('id_ficha', $detalle->id_ficha)
                    ->where('tipo_participante', 'instructor')
                    ->where('id', '!=', $detalle_id)
                    ->exists();

                if ($existeInstructor) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Esta ficha ya tiene un instructor asignado.'
                    ], 422);
                }
            }

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

            // REGLA DE NEGOCIO: Solo un instructor por ficha
            if ($request->tipo_participante === 'instructor') {
                $existeInstructor = DetalleFichaUsuarios::where('id_ficha', $id_ficha)
                    ->where('tipo_participante', 'instructor')
                    ->where('doc', '!=', $doc)
                    ->exists();

                if ($existeInstructor) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Esta ficha ya tiene un instructor asignado.'
                    ], 422);
                }
            }

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
            // Fix N+1: eager load entidad and active asignaciones with their equipment
            $usuarios = $ficha->usuarios()
                ->select(
                    'usuarios.doc', 
                    'usuarios.primer_nombre', 
                    'usuarios.segundo_nombre', 
                    'usuarios.primer_apellido', 
                    'usuarios.segundo_apellido',
                    'usuarios.nit_entidad',
                    'usuarios.imagen',
                    'detalle_ficha_usuarios.tipo_participante',
                    'detalle_ficha_usuarios.id as detalle_id'
                )
                ->with(['entidad', 'asignaciones' => function($q) {
                    $q->where('estado', 'activo')->with('equipo.marca');
                }])
                ->get();

            foreach ($usuarios as $usuario) {
                // Buscamos si tiene alguna asignacion activa (ya cargada vía Eager Loading)
                $asignacion = $usuario->asignaciones->first();

                if ($asignacion && $asignacion->equipo) {
                    $equipo = $asignacion->equipo;
                    if ($equipo->tipo_equipo === 'propio') {
                        $usuario->equipo_info = "Aplica equipo propio";
                    } else {
                        $usuario->equipo_info = "SENA - Placa: " . $equipo->placa_sena . " / Serial: " . $equipo->serial;
                    }
                } else {
                    $usuario->equipo_info = "Sin equipo asignado";
                }

                // Asegurar que la entidad venga cargada (ya cargada vía Eager Loading)
                $usuario->entidad = $usuario->entidad ? (array) $usuario->entidad->toArray() : null;
            }

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

    /**
     * Returns all fichas where the authenticated user is an instructor.
     */
    public function getInstructorFichas(Request $request)
    {
        try {
            $user = $request->user();

            $fichas = DetalleFichaUsuarios::where('doc', $user->doc)
                ->where('tipo_participante', 'instructor')
                ->with(['ficha.programa:id,programa'])
                ->get()
                ->map(function ($detalle) {
                    $ficha = $detalle->ficha;
                    return [
                        'id' => $ficha->id,
                        'numero_ficha' => $ficha->numero_ficha,
                        'nombre_programa' => $ficha->programa->programa ?? null,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $fichas
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener fichas del instructor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getInstructorAsistenciaBase(Request $request)
    {
        try {
            $user = $request->user();
            $fichaIdParam = $request->query('ficha_id');

            if ($fichaIdParam) {
                // Validate membership
                $detalle = DetalleFichaUsuarios::where('doc', $user->doc)
                    ->where('tipo_participante', 'instructor')
                    ->where('id_ficha', $fichaIdParam)
                    ->first();
            } else {
                // Fallback: first ficha
                $detalle = DetalleFichaUsuarios::where('doc', $user->doc)
                    ->where('tipo_participante', 'instructor')
                    ->first();
            }

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
            $fichaIdParam = $request->query('ficha_id');

            // 1. IDENTIFICAR LA FICHA DEL INSTRUCTOR
            if ($fichaIdParam) {
                $detalleInstructor = DetalleFichaUsuarios::where('doc', $user->doc)
                    ->where('tipo_participante', 'instructor')
                    ->where('id_ficha', $fichaIdParam)
                    ->first();
            } else {
                $detalleInstructor = DetalleFichaUsuarios::where('doc', $user->doc)
                    ->where('tipo_participante', 'instructor')
                    ->first();
            }

            if (!$detalleInstructor) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes una ficha asignada como instructor.'
                ], 403);
            }

            $fichaId = $detalleInstructor->id_ficha;

            // 2. CONSULTA OPTIMIZADA (Eager Loading Constrained)
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
    public function getInstructorEquiposAsignados(Request $request)
    {
        try {
            $user = $request->user();
            $fichaIdParam = $request->query('ficha_id');

            // 1. IDENTIFICAR LA FICHA DEL INSTRUCTOR
            if ($fichaIdParam) {
                $detalleInstructor = DetalleFichaUsuarios::where('doc', $user->doc)
                    ->where('tipo_participante', 'instructor')
                    ->where('id_ficha', $fichaIdParam)
                    ->first();
            } else {
                $detalleInstructor = DetalleFichaUsuarios::where('doc', $user->doc)
                    ->where('tipo_participante', 'instructor')
                    ->first();
            }

            if (!$detalleInstructor) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes una ficha asignada como instructor.'
                ], 403);
            }

            $fichaId = $detalleInstructor->id_ficha;
            $ficha = Fichas::find($fichaId);

            // 2. OBTENER LOS EQUIPOS ASIGNADOS A LOS APRENDICES DE ESA FICHA
            $equipos = Usuarios::whereHas('fichas', function($q) use ($fichaId) {
                    $q->where('fichas.id', $fichaId)
                      ->where('detalle_ficha_usuarios.tipo_participante', 'aprendiz');
                })
                ->whereHas('asignaciones', function($q) {
                    $q->where('estado', 'activo');
                })
                ->with(['asignaciones' => function($q) {
                    $q->where('estado', 'activo')->with('equipo');
                }])
                ->get()
                ->map(function($usuario) {
                    $asignacion = $usuario->asignaciones->first();
                    $equipo = $asignacion->equipo;
                    return (object)[
                        'usuario_doc' => $usuario->doc,
                        'primer_nombre' => $usuario->primer_nombre,
                        'segundo_nombre' => $usuario->segundo_nombre,
                        'primer_apellido' => $usuario->primer_apellido,
                        'segundo_apellido' => $usuario->segundo_apellido,
                        'serial' => $equipo->serial,
                        'tipo_equipo' => $equipo->tipo_equipo,
                        'placa_sena' => $equipo->placa_sena,
                        'modelo' => $equipo->modelo,
                        'tipo_equipo_desc' => $equipo->tipo_equipo_desc
                    ];
                });

            // Formatear los datos para el frontend
            $datosFormateados = $equipos->map(function ($equipo) {
                $nombres = trim($equipo->primer_nombre . ' ' . ($equipo->segundo_nombre ?? ''));
                $apellidos = trim($equipo->primer_apellido . ' ' . ($equipo->segundo_apellido ?? ''));

                return [
                    'usuario_doc' => $equipo->usuario_doc,
                    'nombre_completo' => $nombres . ' ' . $apellidos,
                    'serial' => $equipo->serial,
                    'tipo_equipo' => $equipo->tipo_equipo,
                    'placa_sena' => $equipo->placa_sena,
                    'modelo' => $equipo->modelo,
                    'tipo_equipo_desc' => $equipo->tipo_equipo_desc
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'ficha' => [
                        'id' => $ficha->id,
                        'numero_ficha' => $ficha->numero_ficha
                    ],
                    'equipos' => $datosFormateados
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los equipos de la ficha',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
