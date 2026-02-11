<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware CORS para Laravel 12
 * 
 * Este middleware maneja las peticiones CORS permitiendo que React
 * pueda comunicarse con la API de Laravel.
 * 
 * INSTALACIÓN:
 * 1. Copiar este archivo a: app/Http/Middleware/HandleCors.php
 * 2. Registrar en bootstrap/app.php (ver instrucciones abajo)
 * 
 * @version 1.0.0
 */
class HandleCors
{
    /**
     * Manejar una petición entrante
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Orígenes permitidos - MODIFICAR SEGÚN TU ENTORNO
        $allowedOrigins = [
            'http://localhost:5173',  // Vite dev server
            'http://localhost:3000',  // Alternativa
            'http://127.0.0.1:5173',  // Variante
        ];

        // Obtener el origen de la petición
        $origin = $request->header('Origin');

        // Si la petición es OPTIONS (preflight), responder inmediatamente
        if ($request->isMethod('OPTIONS')) {
            return response('', 200)
                ->header('Access-Control-Allow-Origin', in_array($origin, $allowedOrigins) ? $origin : '')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, X-Requested-With')
                ->header('Access-Control-Max-Age', '86400'); // 24 horas
        }

        // Procesar la petición normalmente
        $response = $next($request);

        // Agregar headers CORS a la respuesta
        if (in_array($origin, $allowedOrigins)) {
            $response->headers->set('Access-Control-Allow-Origin', $origin);
            $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, X-Requested-With');
            $response->headers->set('Access-Control-Allow-Credentials', 'false');
        }

        return $response;
    }
}
