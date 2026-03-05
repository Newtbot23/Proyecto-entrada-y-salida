<?php

namespace App\Http\Requests\Api\Planes;

use Illuminate\Foundation\Http\FormRequest;

class StorePlanRequest extends FormRequest
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
            'nombre_plan' => 'required|string|max:200|regex:/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s]+$/',
            'periodo_facturacion' => 'required|string|in:mensual,anual',
            'caracteristicas' => 'required|array',
            'descripcion' => 'required|string',
            'duracion_plan' => 'required|integer|min:1',
            'precio_plan' => 'required|numeric|min:0',
            'estado' => 'sometimes|required|string|in:activo,inactivo',
        ];
    }
}
