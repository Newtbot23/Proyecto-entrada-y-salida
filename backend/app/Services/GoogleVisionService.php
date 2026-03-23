<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GoogleVisionService
{
    protected $apiKey;
    protected $baseUrl = 'https://vision.googleapis.com/v1/images:annotate';

    public function __construct()
    {
        $this->apiKey = config('services.google.google_vision_api_key');
    }

    /**
     * Petición genérica a Google Vision API
     */
    public function annotateImage(string $base64Image, array $features)
    {
        if (!$this->apiKey) {
            throw new \Exception('Configuración de API Vision faltante (GOOGLE_VISION_API_KEY)');
        }

        $url = "{$this->baseUrl}?key={$this->apiKey}";

        $payload = [
            'requests' => [
                [
                    'image' => [
                        'content' => $base64Image
                    ],
                    'features' => $features
                ]
            ]
        ];

        try {
            $response = Http::post($url, $payload);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Google Vision API Error', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            throw new \Exception('Error al comunicarse con Google Vision API');
        } catch (\Exception $e) {
            Log::error('Google Vision Connection Error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Detectar y parsear placa de vehículo
     */
    public function parsePlate(string $base64Image)
    {
        $result = $this->annotateImage($base64Image, [['type' => 'TEXT_DETECTION']]);
        $responses = $result['responses'] ?? [];

        if (isset($responses[0]['textAnnotations'][0]['description'])) {
            $description = $responses[0]['textAnnotations'][0]['description'];

            // Extraemos 6 caracteres alfanuméricos agrupados en 3 y 3, separados opcionalmente por guiones o espacios
            if (preg_match('/([A-Z0-9]{3})[-\s._]*([A-Z0-9]{3})/i', $description, $matches)) {
                $letras = strtoupper($matches[1]);
                $numeros = strtoupper($matches[2]);

                // Autocorrección para las 3 primeras letras
                $letras = str_replace(['0', '1', '8', '5'], ['O', 'I', 'B', 'S'], $letras);

                // Autocorrección para los 2 siguientes (números)
                $numerosPrefix = substr($numeros, 0, 2);
                $numerosPrefix = str_replace(['O', 'I', 'B', 'S'], ['0', '1', '8', '5'], $numerosPrefix);

                $numerosSuffix = substr($numeros, 2, 1);

                return $letras . $numerosPrefix . $numerosSuffix;
            }
        }

        return null;
    }

    /**
     * Detectar y parsear serial de equipo
     */
    public function parseSerial(string $base64Image)
    {
        $result = $this->annotateImage($base64Image, [['type' => 'TEXT_DETECTION']]);
        $responses = $result['responses'] ?? [];

        if (isset($responses[0]['textAnnotations'][0]['description'])) {
            $description = $responses[0]['textAnnotations'][0]['description'];

            if (preg_match('/(?:S\/N|SN|S\.N\.|Serial(?:\s*No\.?|\s*Number)?|Service\s*Tag)\s*[:.\-#]?\s*([A-Z0-9-]+)/i', $description, $matches)) {
                return [
                    'serial' => $matches[1],
                    'raw_text' => preg_replace('/\s+/', ' ', $description)
                ];
            }

            return [
                'serial' => null,
                'raw_text' => preg_replace('/\s+/', ' ', $description)
            ];
        }

        return null;
    }

    /**
     * Validar presencia de rostro humano
     */
    public function detectFace(string $base64Image)
    {
        $result = $this->annotateImage($base64Image, [['type' => 'FACE_DETECTION']]);
        $responses = $result['responses'] ?? [];

        return !empty($responses[0]['faceAnnotations']);
    }
}
