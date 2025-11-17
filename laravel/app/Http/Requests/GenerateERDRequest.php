<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GenerateERDRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'prd.PRD' => ['required', 'string'],
            'feature.name' => ['required', 'string'],
            'feature.acceptance_criteria' => ['nullable', 'string'],
            'feature.user_flows' => ['nullable', 'string'],
            'feature.metrics' => ['nullable', 'string'],
            'feature.description' => ['nullable', 'string'],
        ];
    }
}


