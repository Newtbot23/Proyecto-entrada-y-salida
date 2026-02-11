<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PlanesLicencia;

class PlanesLicenciaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            [
                'nombre_plan' => 'Basic',
                'precio_plan' => 19,
                'duracion_plan' => now()->addMonth(), // Example duration
                'caracteristicas' => [
                    ['text' => '1 User Account', 'included' => true],
                    ['text' => '10 Projects', 'included' => true],
                    ['text' => 'Basic Analytics', 'included' => true],
                    ['text' => '24/7 Support', 'included' => false],
                    ['text' => 'Advanced Integrations', 'included' => false],
                ],
            ],
            [
                'nombre_plan' => 'Professional',
                'precio_plan' => 49,
                'duracion_plan' => now()->addMonth(),
                'caracteristicas' => [
                    ['text' => '5 User Accounts', 'included' => true],
                    ['text' => 'Unlimited Projects', 'included' => true],
                    ['text' => 'Advanced Analytics', 'included' => true],
                    ['text' => 'Priority Support', 'included' => true],
                    ['text' => 'Advanced Integrations', 'included' => false],
                ],
            ],
            [
                'nombre_plan' => 'Enterprise',
                'precio_plan' => 99,
                'duracion_plan' => now()->addMonth(),
                'caracteristicas' => [
                    ['text' => 'Unlimited Users', 'included' => true],
                    ['text' => 'Unlimited Projects', 'included' => true],
                    ['text' => 'Custom Analytics', 'included' => true],
                    ['text' => 'Dedicated Support Agent', 'included' => true],
                    ['text' => 'Custom Integrations', 'included' => true],
                ],
            ],
        ];

        foreach ($plans as $plan) {
            PlanesLicencia::create($plan);
        }
    }
}
