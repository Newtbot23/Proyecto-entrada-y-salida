<?php

namespace App\Http\Requests\Api\Equipos;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreEquipoRequest extends FormRequest
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
            'serial' => 'required|string|max:100|unique:equipos,serial',
            'id_marca' => 'required|integer',
            'modelo' => 'required|string|max:100',
            'tipo_equipo_desc' => 'required|string|max:200',
            'caracteristicas' => 'nullable|string',
            'id_sistema_operativo' => 'required|integer',
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
