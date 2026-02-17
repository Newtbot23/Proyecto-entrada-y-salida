<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;

class EnsureResponseTime
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $start = microtime(true);

        $response = $next($request);

        $end = microtime(true);
        $duration = ($end - $start) * 1000; // milliseconds

        // Enforce minimum 500ms
        if ($duration < 500) {
            $delay = (500 - $duration) * 1000; // microseconds
            usleep((int) $delay);
        }

        // Log if exceeds 4s (4000ms)
        if ($duration > 4000) {
            Log::warning("Slow response detected: {$request->fullUrl()} took {$duration}ms");
        }

        return $response;
    }
}
