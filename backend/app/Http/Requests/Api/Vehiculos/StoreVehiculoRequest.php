<?php

namespace App\Http\Requests\Api\Vehiculos;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreVehiculoRequest extends FormRequest
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
            'placa' => 'required|string|max:10|unique:vehiculos,placa',
            'id_tipo_vehiculo' => 'required|integer',
            'id_marca' => 'required|integer|exists:marcas_vehiculo,id',
            'modelo' => 'required|string|max:100',
            'color' => 'required|string|max:50',
            'descripcion' => 'nullable|string',
            'foto_general' => 'nullable|image|mimes:jpeg,png,jpg|max:5120',
            'foto_detalle' => 'nullable|image|mimes:jpeg,png,jpg|max:5120'
        ];
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Errores de validación',
            'errors' => $validator->errors()
        ], 422));
    }
}
