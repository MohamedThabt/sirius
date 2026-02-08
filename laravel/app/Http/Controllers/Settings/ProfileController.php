<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Support\AppLogger;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    use \App\Traits\StructuredLogger;
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        try {
            $request->user()->fill($request->validated());

            if ($request->user()->isDirty('email')) {
                $request->user()->email_verified_at = null;
            }

            $request->user()->save();

            AppLogger::business('user.profile.updated', [
                'user_id' => $request->user()->id,
                'changed_attributes' => array_keys($request->user()->getChanges()),
            ]);

            return to_route('profile.edit');
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'profile_update']);
            throw $e;
        }
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        try {
            $user = $request->user();
            $userId = $user->id;
            $userEmail = $user->email;

            Auth::logout();

            $user->delete();

            AppLogger::security('user.account.deleted', [
                'user_id' => $userId,
                'email' => $userEmail,
            ], 'warning');

            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect('/');
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'account_delete']);
            throw $e;
        }
    }
}
