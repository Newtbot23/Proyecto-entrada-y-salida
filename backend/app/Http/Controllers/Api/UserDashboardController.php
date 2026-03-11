<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use App\Models\Vehiculos;
use App\Models\Equipos;

class UserDashboardController extends Controller
{
    public function getCatalogs()
    {
        $tiposVehiculo = DB::table('tipos_vehiculo')->select('id', 'tipo_vehiculo')->get();
        $marcasEquipo = DB::table('marcas_equipo')->select('id', 'marca')->get();
        $sistemasOperativos = DB::table('sistemas_operativos')->select('id', 'sistema_operativo')->get();

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

        $vehiculos = DB::table('vehiculos')
            ->join('tipos_vehiculo', 'vehiculos.id_tipo_vehiculo', '=', 'tipos_vehiculo.id')
            ->where('vehiculos.doc', $user->doc)
            ->select('vehiculos.*', 'tipos_vehiculo.tipo_vehiculo')
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

        $equipos = DB::table('equipos')
            ->join('marcas_equipo', 'equipos.id_marca', '=', 'marcas_equipo.id')
            ->join('sistemas_operativos', 'equipos.id_sistema_operativo', '=', 'sistemas_operativos.id')
            ->where('equipos.doc', $user->doc)
            ->select('equipos.*', 'marcas_equipo.marca', 'sistemas_operativos.sistema_operativo as so')
            ->get();

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

        $query = DB::table('registros')
            ->leftJoin('vehiculos', 'registros.placa', '=', 'vehiculos.placa')
            ->leftJoin('equipos', 'registros.serial_equipo', '=', 'equipos.serial')
            ->leftJoin('marcas_equipo', 'equipos.id_marca', '=', 'marcas_equipo.id')
            ->where('registros.doc', $user->doc);

        if ($request->has('fecha') && !empty($request->fecha)) {
            $query->whereDate('registros.fecha', $request->fecha);
        } else {
            // Default to last 5 entries if no date filter is provided
            $query->limit(5);
        }

        $entradas = $query
            ->select(
                'registros.id',
                'registros.fecha',
                'registros.hora_entrada',
                'registros.hora_salida',
                'registros.placa',
                'registros.serial_equipo',
                'vehiculos.marca as vehiculo_marca',
                'vehiculos.modelo as vehiculo_modelo',
                'vehiculos.color as vehiculo_color',
                'equipos.modelo as equipo_modelo',
                'marcas_equipo.marca as equipo_marca'
            )
            ->orderBy('registros.fecha', 'desc')
            ->orderBy('registros.hora_entrada', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $entradas
        ]);
    }

    public function readPlate(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg|max:5120',
        ]);

        try {
            $imagePath = $request->file('image')->getPathname();
            $base64Image = base64_encode(file_get_contents($imagePath));

            $apiKey = env('GOOGLE_VISION_API_KEY');
            if (!$apiKey) {
                return response()->json(['success' => false, 'message' => 'Configuración de API Vision faltante'], 500);
            }

            $url = 'https://vision.googleapis.com/v1/images:annotate?key=' . $apiKey;

            $payload = [
                'requests' => [
                    [
                        'image' => [
                            'content' => $base64Image
                        ],
                        'features' => [
                            [
                                'type' => 'TEXT_DETECTION'
                            ]
                        ]
                    ]
                ]
            ];

            $response = Http::post($url, $payload);

            if ($response->successful()) {
                $result = $response->json();
                $responses = $result['responses'] ?? [];
                
                if (isset($responses[0]['textAnnotations'][0]['description'])) {
                    $description = $responses[0]['textAnnotations'][0]['description'];
                    
                    // Extraemos 6 caracteres alfanuméricos agrupados en 3 y 3, separados opcionalmente por guiones o espacios
                    preg_match('/([A-Z0-9]{3})[-\s._]*([A-Z0-9]{3})/i', $description, $matches);
                    
                    if (isset($matches[1]) && isset($matches[2])) {
                        $letras = strtoupper($matches[1]);
                        $numeros = strtoupper($matches[2]);

                        // Autocorrección para las 3 primeras letras (reemplazo de números por letras comunes)
                        $letras = str_replace(
                            ['0', '1', '8', '5'], 
                            ['O', 'I', 'B', 'S'], 
                            $letras
                        );

                        // Autocorrección para los 2 siguientes (siempre números en Colombia)
                        $numerosPrefix = substr($numeros, 0, 2);
                        $numerosPrefix = str_replace(
                            ['O', 'I', 'B', 'S'], 
                            ['0', '1', '8', '5'], 
                            $numerosPrefix
                        );

                        // El último carácter puede ser letra o número dependiendo si es moto o carro
                        $numerosSuffix = substr($numeros, 2, 1);

                        $placa = $letras . $numerosPrefix . $numerosSuffix;
                        
                        return response()->json([
                            'success' => true,
                            'placa' => $placa,
                            'message' => 'Placa detectada con éxito'
                        ]);
                    }
                }
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

    public function readSerial(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg|max:5120',
        ]);

        try {
            $imagePath = $request->file('image')->getPathname();
            $base64Image = base64_encode(file_get_contents($imagePath));

            $apiKey = env('GOOGLE_VISION_API_KEY');
            if (!$apiKey) {
                return response()->json(['success' => false, 'message' => 'Configuración de API Vision faltante'], 500);
            }

            $url = 'https://vision.googleapis.com/v1/images:annotate?key=' . $apiKey;

            $payload = [
                'requests' => [
                    [
                        'image' => [
                            'content' => $base64Image
                        ],
                        'features' => [
                            [
                                'type' => 'TEXT_DETECTION'
                            ]
                        ]
                    ]
                ]
            ];

            $response = Http::post($url, $payload);

            if ($response->successful()) {
                $result = $response->json();
                $responses = $result['responses'] ?? [];
                
                if (isset($responses[0]['textAnnotations'][0]['description'])) {
                    $description = $responses[0]['textAnnotations'][0]['description'];
                    
                    // Buscar prefijos comunes de serial con una expresión regular: "S/N", "SN:", "Serial:", "Serial No", etc.
                    // Y capturar la cadena alfanumérica contigua o que le siga después de espacios/dos puntos/guiones.
                    // Ejemplo de patrones a buscar: "S/N 12345ABC", "Serial: XYZ-987", "SN:123"
                    $extracted_serial = null;
                         
                    if (preg_match('/(?:S\/N|SN|S\.N\.|Serial(?:\s*No\.?|\s*Number)?|Service\s*Tag)\s*[:.\-#]?\s*([A-Z0-9-]+)/i', $description, $matches)) {
                        $extracted_serial = $matches[1];
                    }
                    
                    // Raw text para validación manual en frontend
                    // Removemos saltos de línea y espacios extras para facilitar el `includes`
                    $raw_text = preg_replace('/\s+/', ' ', $description);

                    return response()->json([
                        'success' => true,
                        'extracted_serial' => $extracted_serial,
                        'raw_text' => $raw_text,
                        'message' => 'Texto extraído exitosamente'
                    ]);
                }
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

    public function storeVehiculo(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'No autenticado'], 401);
        }

        $request->validate([
            'placa' => 'required|string|max:10|unique:vehiculos,placa',
            'id_tipo_vehiculo' => 'required|integer',
            'marca' => 'required|string|max:100',
            'modelo' => 'required|string|max:100',
            'color' => 'required|string|max:50',
            'descripcion' => 'nullable|string',
            'img_vehiculo' => 'nullable|image|mimes:jpeg,png,jpg|max:5120'
        ]);

        try {
            $imgPath = null;
            if ($request->hasFile('img_vehiculo')) {
                $imgPath = $request->file('img_vehiculo')->store('vehiculos', 'public');
            }

            DB::table('vehiculos')->insert([
                'placa' => strtoupper($request->placa),
                'id_tipo_vehiculo' => $request->id_tipo_vehiculo,
                'doc' => $user->doc,
                'marca' => $request->marca,
                'modelo' => $request->modelo,
                'color' => $request->color,
                'descripcion' => $request->descripcion ?? '',
                'img_vehiculo' => $imgPath,
                'created_at' => now(),
                'updated_at' => now(),
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

    public function storeEquipo(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'No autenticado'], 401);
        }

        $request->validate([
            'serial' => 'required|string|max:100|unique:equipos,serial',
            'id_marca' => 'required|integer',
            'modelo' => 'required|string|max:100',
            'tipo_equipo_desc' => 'required|string|max:200',
            'caracteristicas' => 'nullable|string',
            'id_sistema_operativo' => 'required|integer',
            'img_serial' => 'nullable|image|mimes:jpeg,png,jpg|max:5120'
        ]);

        try {
            $imgPath = null;
            if ($request->hasFile('img_serial')) {
                $imgPath = $request->file('img_serial')->store('equipos', 'public');
            }

            DB::table('equipos')->insert([
                'serial' => $request->serial,
                'tipo_equipo' => 'propio',
                'placa_sena' => 'N/A', // Placa sena defaults to N/A for propio
                'id_marca' => $request->id_marca,
                'estado' => 'no_asignado',
                'modelo' => $request->modelo,
                'tipo_equipo_desc' => $request->tipo_equipo_desc,
                'caracteristicas' => $request->caracteristicas ?? '',
                'id_sistema_operativo' => $request->id_sistema_operativo,
                'img_serial' => $imgPath,
                'doc' => $user->doc,
                'created_at' => now(),
                'updated_at' => now(),
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
}
