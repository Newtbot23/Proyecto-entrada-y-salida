<?php

namespace App\Http\Requests\Api\Licencias;

use Illuminate\Foundation\Http\FormRequest;

class UpdateReferenciaRequest extends FormRequest
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
            'referencia_pago' => 'required|string|max:255',
        ];
    }
}
