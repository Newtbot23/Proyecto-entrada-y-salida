<?php

namespace App\Http\Requests\Api\Entidades;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEntidadRequest extends FormRequest
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
        $id = $this->route('id'); // EntidadesController uses {id}

        return [
            'nombre_entidad' => 'sometimes|required|string|min:8|max:200|regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/',
            'correo' => 'sometimes|required|email|min:8|max:200|unique:entidades,correo,' . $id,
            'direccion' => 'sometimes|required|string|min:8|max:200|regex:/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s,.-]+$/',
            'nombre_titular' => 'sometimes|required|string|min:8|max:100|regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/',
            'telefono' => 'sometimes|required|string|min:8|max:15|regex:/^[0-9+\-\s()]+$/',
            'nit' => 'sometimes|required|string|min:6|max:15|unique:entidades,nit,' . $id . '|regex:/^[0-9\-]+$/',
            'estado' => 'sometimes|string|in:activo,pendiente,inactivo',
        ];
    }
}
