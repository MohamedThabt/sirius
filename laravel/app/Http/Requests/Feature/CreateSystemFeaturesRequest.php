<?php

namespace App\Http\Requests\Feature;

use Illuminate\Foundation\Http\FormRequest;

class CreateSystemFeaturesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'features' => ['required', 'array', 'min:1'],
            'features.*.name' => ['required', 'string', 'min:2'],
            'features.*.description' => ['required', 'string', 'min:5'],
        ];
    }
}


