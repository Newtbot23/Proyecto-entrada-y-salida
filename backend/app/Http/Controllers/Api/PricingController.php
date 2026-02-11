<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\PlanesLicencia;

class PricingController extends Controller
{
    /**
     * Get all pricing plans.
     */
    public function index(): JsonResponse
    {
        $planes = PlanesLicencia::all();

        $plans = $planes->map(function ($plan) {
            return [
                'id' => $plan->id,
                'name' => $plan->nombre_plan,
                'price' => '$' . $plan->precio_plan,
                'period' => $plan->periodo_facturacion === 'monthly' ? '/mo' : '/yr',
                'description' => $plan->descripcion,
                'features' => $plan->caracteristicas,
                'button_text' => $plan->nombre_plan === 'Enterprise' ? 'Contact Us' : 'Select ' . $plan->nombre_plan,
                'is_popular' => $plan->nombre_plan === 'Professional',
            ];
        });

        return response()->json($plans);
    }

    /**
     * Helper to get description based on plan name (can be moved to DB later)
     */
    private function getPlanDescription(string $name): string
    {
        return match ($name) {
            'Basic' => 'Essential features for individuals.',
            'Professional' => 'Power and flexibility for growing teams.',
            'Enterprise' => 'Full-scale solutions for large organizations.',
            default => '',
        };
    }

    /**
     * Select a pricing plan.
     */
    public function select(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'plan_id' => 'required|string',
        ]);

        return response()->json([
            'message' => 'Plan selected successfully',
            'plan_id' => $validated['plan_id'],
        ]);
    }
}
