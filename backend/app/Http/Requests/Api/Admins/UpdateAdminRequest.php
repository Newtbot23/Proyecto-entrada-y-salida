<?php

namespace App\Http\Requests\Api\Admins;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAdminRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $doc = $this->route('admin');

        return [
            'doc' => 'sometimes|required|string|regex:/^[0-9]{7,10}$/',

            'nombre' => 'sometimes|required|string|max:200|regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/',

            'telefono' => 'sometimes|required|string|max:200|regex:/^[0-9+\-\s()]+$/',

            // FIX: indicar PK = doc en unique
            'correo' => 'sometimes|required|email|max:200|unique:admins,correo,' . $doc . ',doc',

            'contrasena' => 'sometimes|nullable|string|min:6',
        ];
    }
}