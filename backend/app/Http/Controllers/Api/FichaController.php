<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Fichas;
use App\Models\DetalleFichaUsuarios;
use App\Models\Usuarios;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
            // 1. Identificar la entidad del usuario/admin autenticado para aislar los datos
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado'
                ], 401);
            }
            
            $nitEntidad = $user->nit_entidad;

            // 2. Obtenemos los documentos de los usuarios "ocupados"
            $usuariosOcupados = DB::table('detalle_ficha_usuarios')
                ->join('fichas', 'detalle_ficha_usuarios.id_ficha', '=', 'fichas.id')
                ->where('fichas.estado', '!=', 'Finalizada')
                ->pluck('detalle_ficha_usuarios.doc');

            // 3. Traemos a los disponibles: No ocupados, tipo 2 (users) y EXCLUSIVOS de la entidad actual
            $usuariosDisponibles = Usuarios::whereNotIn('doc', $usuariosOcupados)
                ->where('id_rol', 2)
                ->where('nit_entidad', $nitEntidad) // <-- AISLAMIENTO CRÍTICO APLICADO
                ->get();

            return response()->json([
                'success' => true,
                'data' => $usuariosDisponibles
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
                ->orderByRaw("FIELD(estado, 'Lectiva', 'Practica', 'Finalizada')")
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
            'usuarios'   => 'required|array|min:1',
            'usuarios.*' => 'required|integer|exists:usuarios,doc'
        ]);

        try {
            DB::transaction(function () use ($request, $id) {
                // Eliminar asignaciones previas de esta ficha para evitar duplicados
                DetalleFichaUsuarios::where('id_ficha', $id)->delete();

                // Insertar los nuevos registros forzando tipo_participante = 'aprendiz'
                $data = [];
                foreach ($request->usuarios as $doc) {
                    $data[] = [
                        'id_ficha'          => $id,
                        'doc'               => $doc,
                        'tipo_participante' => 'aprendiz',
                        'created_at'        => now(),
                        'updated_at'        => now(),
                    ];
                }

                DetalleFichaUsuarios::insert($data);
            });

            return response()->json([
                'success' => true,
                'message' => 'Usuarios asignados exitosamente',
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

            // 1. Si el nuevo rol es instructor, verificar que no haya otro ya asignado
            if ($request->tipo_participante === 'instructor') {
                $instructorCount = DB::table('detalle_ficha_usuarios')
                    ->where('id_ficha', $detalle->id_ficha)
                    ->where('tipo_participante', 'instructor')
                    ->where('id', '!=', $detalle_id) // No contamos a nosotros mismos
                    ->count();

                if ($instructorCount >= 1) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Esta ficha ya tiene un instructor titular asignado. Cambia al actual a \'aprendiz\' primero.'
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

            // 1. Si el nuevo rol es instructor, verificar que no haya otro ya asignado
            if ($request->tipo_participante === 'instructor') {
                $instructorCount = DB::table('detalle_ficha_usuarios')
                    ->where('id_ficha', $id_ficha)
                    ->where('tipo_participante', 'instructor')
                    ->where('doc', '!=', $doc) 
                    ->count();

                if ($instructorCount >= 1) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Esta ficha ya tiene un instructor titular asignado. Cambia al actual a \'aprendiz\' primero.'
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
        $request->validate(['estado' => 'required|in:Lectiva,Practica,Finalizada']);
        DB::table('fichas')->where('id', $id)->update(['estado' => $request->estado]);
        return response()->json(['message' => 'Estado actualizado exitosamente']);
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
}
