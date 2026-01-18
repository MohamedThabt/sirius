<?php

namespace App\Http\Requests\Admin;

use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class AdminLoginRequest extends FormRequest
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
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        if (! Auth::guard('admin')->attempt($this->only('email', 'password'), $this->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey(), $this->getDecaySeconds());

            throw ValidationException::withMessages([
                'email' => __('The provided credentials do not match our records.'),
            ]);
        }

        RateLimiter::clear($this->throttleKey());
        $this->session()->regenerate();
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        // Allow 3 attempts before rate limiting kicks in
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 3)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => __('Too many login attempts. Please try again in :minutes minutes and :seconds seconds.', [
                'minutes' => floor($seconds / 60),
                'seconds' => $seconds % 60,
            ]),
        ]);
    }

    /**
     * Get the decay seconds based on number of failed attempts.
     * Progressive: 2 min -> 5 min -> 10 min -> 30 min -> 1 hour
     */
    protected function getDecaySeconds(): int
    {
        $attempts = RateLimiter::attempts($this->throttleKey());

        return match (true) {
            $attempts >= 15 => 3600,  // 1 hour after 15+ attempts
            $attempts >= 10 => 1800,  // 30 minutes after 10+ attempts
            $attempts >= 7 => 600,    // 10 minutes after 7+ attempts
            $attempts >= 5 => 300,    // 5 minutes after 5+ attempts
            default => 120,           // 2 minutes base
        };
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return 'admin_login:' . $this->string('email')
            ->lower()
            ->append('|' . $this->ip())
            ->transliterate()
            ->value();
    }
}
