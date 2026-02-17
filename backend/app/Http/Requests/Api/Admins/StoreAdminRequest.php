<?php

namespace App\Http\Requests\Api\Admins;

use Illuminate\Foundation\Http\FormRequest;

class StoreAdminRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'doc' => 'required|integer|unique:admins,doc|regex:/^[0-9]+$/',
            'nombre' => 'required|string|max:200|regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/',
            'telefono' => 'required|string|max:200|regex:/^[0-9+\-\s()]+$/',
            'correo' => 'required|email|max:200|unique:admins,correo',
            'contrasena' => 'required|string|min:6',
        ];
    }
}
