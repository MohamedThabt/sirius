<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;

class VerifyEmailController extends Controller
{
    use \App\Traits\StructuredLogger;

    /**
     * Mark the authenticated user's email address as verified.
     */
    public function __invoke(EmailVerificationRequest $request): RedirectResponse
    {
        try {
            if ($request->user()->hasVerifiedEmail()) {
                return redirect()->intended(route('dashboard', absolute: false).'?verified=1');
            }

            if ($request->fulfill()) {
                \App\Support\AppLogger::security('user.email.verified', [
                    'user_id' => $request->user()->id,
                    'email' => $request->user()->email,
                ], 'info');
            }

            return redirect()->intended(route('dashboard', absolute: false).'?verified=1');
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'verify_email']);
            throw $e;
        }
    }
}
