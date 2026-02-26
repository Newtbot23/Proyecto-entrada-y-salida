<?php

namespace App\Http\Requests\Api\Planes;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePlanRequest extends FormRequest
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
            'nombre_plan' => 'sometimes|required|string|max:200|regex:/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s]+$/',
            'periodo_facturacion' => 'sometimes|required|string|in:mensual,anual',
            'caracteristicas' => 'sometimes|array',
            'descripcion' => 'sometimes|required|string',
            'duracion_plan' => 'sometimes|required|integer|min:1',
            'precio_plan' => 'sometimes|required|numeric|min:0',
            'estado' => 'sometimes|required|string|in:activo,inactivo',
        ];
    }
}
