<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use App\Services\NitService;

class ValidNit implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!is_string($value)) {
            $fail('El :attribute debe ser una cadena de texto.');
            return;
        }

        // First check strict regex format
        // Only numbers and hyphens allowed. Length 8 to 17 (15 digits + hyphen + DV)
        if (!preg_match('/^[0-9-]{8,17}$/', $value)) {
             $fail('El formato del :attribute es inválido. Solo se permiten números y guiones.');
             return;
        }

        if (!NitService::validateNit($value)) {
             $data = NitService::normalizeNit($value);
             $expectedDv = NitService::calculateDV($data['base']);
             $fail("El dígito de verificación es inválido. Para el NIT {$data['base']} el dígito calculado es $expectedDv.");
        }
    }
}
