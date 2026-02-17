<?php

namespace App\Http\Requests\Api\Entidades;

use Illuminate\Foundation\Http\FormRequest;

class StoreEntidadRequest extends FormRequest
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
            'nombre_entidad' => 'required|string|max:200|regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/',
            'correo' => 'required|email|max:200|unique:entidades,correo',
            'direccion' => 'required|string|max:200|regex:/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s,.-]+$/',
            'nombre_titular' => 'required|string|max:100|regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/',
            'telefono' => 'required|string|max:15|regex:/^[0-9+\-\s()]+$/',
            'nit' => 'required|string|max:15|unique:entidades,nit|regex:/^[0-9\-]+$/',
            'estado' => 'sometimes|string|in:activo,pendiente,inactivo',
        ];
    }
}
