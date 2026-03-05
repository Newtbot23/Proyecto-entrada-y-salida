<?php

namespace App\Services;

class NitService
{
    /**
     * Calculate the verification digit for a NIT.
     * Uses the DIAN algorithm with weights: [71, 67, 59, 53, 47, 43, 41, 37, 29, 23, 19, 17, 13, 7, 3]
     *
     * @param string $nitBase
     * @return int
     */
    public static function calculateDV(string $nitBase): int
    {
        $arr = array_map('intval', str_split($nitBase));
        $len = count($arr);
        $weights = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71]; // Reversed weights
        
        $sum = 0;
        $j = 0;
        
        // Iterate from right to left
        for ($i = $len - 1; $i >= 0; $i--) {
            $sum += $arr[$i] * $weights[$j];
            $j++;
        }
        
        $mod = $sum % 11;
        
        if ($mod > 1) {
            return 11 - $mod;
        }
        
        return $mod;
    }

    /**
     * Normalize valid NIT input into base and optional DV.
     *
     * @param string $input
     * @return array ['base' => string, 'dv' => int|null]
     */
    public static function normalizeNit(string $input): array
    {
        // Remove dots and everything except digits and hyphen
        $input = preg_replace('/[^0-9-]/', '', $input);
        
        if (strpos($input, '-') !== false) {
            $parts = explode('-', $input);
            $base = $parts[0];
            $dv = isset($parts[1]) && $parts[1] !== '' ? (int)$parts[1] : null;
            return ['base' => $base, 'dv' => $dv];
        }
        
        return ['base' => $input, 'dv' => null];
    }

    /**
     * Validate a NIT.
     * Checks generic format and DV if provided.
     *
     * @param string $input
     * @return bool
     */
    public static function validateNit(string $input): bool
    {
        $data = self::normalizeNit($input);
        $base = $data['base'];
        $dv = $data['dv'];
        
        // Basic length check (8 to 15 digits)
        if (strlen($base) < 8 || strlen($base) > 15) {
            return false;
        }

        // If DV is provided, verify it
        if ($dv !== null) {
            $calculatedDv = self::calculateDV($base);
            return $dv === $calculatedDv;
        }

        return true;
    }
}
