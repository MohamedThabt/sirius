<?php

namespace App\Http\Requests\Plan;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $planId = $this->route('plan')->id;

        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('plans', 'name')->ignore($planId)],
            'slug' => ['required', 'string', 'max:255', Rule::unique('plans', 'slug')->ignore($planId)],
            'price' => ['required', 'numeric', 'min:0'],
            'credits_per_cycle' => ['required', 'integer', 'min:0'],
            'billing_cycle' => ['required', 'in:monthly,yearly'],
            'is_active' => ['required', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.unique' => 'A plan with this name already exists.',
            'slug.unique' => 'A plan with this slug already exists.',
            'billing_cycle.in' => 'Billing cycle must be either monthly or yearly.',
        ];
    }
}
