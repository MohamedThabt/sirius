<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Support\AppLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    use \App\Traits\StructuredLogger;
    /**
     * Show the password reset link request page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming password reset link request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        try {
            $request->validate([
                'email' => 'required|email',
            ]);

            AppLogger::security('user.password_reset.requested', [
                'email' => $request->input('email'),
            ], 'info');

            Password::sendResetLink(
                $request->only('email')
            );

            return back()->with('status', __('A reset link will be sent if the account exists.'));
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'password_reset_request']);
            throw $e;
        }
    }
}
