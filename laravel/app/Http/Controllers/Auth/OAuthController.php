<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Notification\TelegramNotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class OAuthController extends Controller
{
    /**
     * Redirect to GitHub OAuth
     */
    public function redirectToGitHub(): RedirectResponse
    {
        return Socialite::driver('github')->redirect();
    }

    /**
     * Handle GitHub OAuth callback
     */
    public function handleGitHubCallback(Request $request): RedirectResponse
    {
        if (Auth::check()) {
            return redirect()->intended(route('projects.index'));
        }

        try {
            $socialUser = Socialite::driver('github')->user();
        } catch (\Exception $e) {
            return redirect()->route('login')->withErrors([
                'oauth' => 'GitHub authentication failed. Please try again.',
            ]);
        }

        $user = $this->findOrCreateUser($socialUser, 'github');

        Auth::login($user);

        $request->session()->regenerate();

        return redirect()->intended(route('projects.index'));
    }

    // -------------------------------------------------------------------------
    // Google — Login
    // -------------------------------------------------------------------------

    public function redirectToGoogleLogin(): RedirectResponse
    {
        session(['oauth_intent' => 'login']);

        return Socialite::driver('google')
            ->redirectUrl(config('app.url') . '/auth/google/login/callback')
            ->redirect();
    }

    public function handleGoogleLoginCallback(Request $request): RedirectResponse
    {
        if (Auth::check()) {
            return redirect()->route('projects.index');
        }

        try {
            $socialUser = Socialite::driver('google')
                ->redirectUrl(config('app.url') . '/auth/google/login/callback')
                ->user();
        } catch (\Exception $e) {
            return redirect()->route('login')->withErrors([
                'oauth' => 'Google authentication failed. Please try again.',
            ]);
        }

        $user = User::where('provider', 'google')
            ->where('provider_id', $socialUser->getId())
            ->orWhere('email', $socialUser->getEmail())
            ->first();

        if (! $user) {
            return redirect()->route('login')->withErrors([
                'oauth' => 'No account found for this Google account. Please register first.',
            ]);
        }

        $this->updateUserFromSocial($user, $socialUser, 'google');

        Auth::login($user);

        $request->session()->regenerate();

        return redirect()->route('projects.index');
    }

    // -------------------------------------------------------------------------
    // Google — Register
    // -------------------------------------------------------------------------

    public function redirectToGoogleRegister(): RedirectResponse
    {
        session(['oauth_intent' => 'register']);

        return Socialite::driver('google')
            ->redirectUrl(config('app.url') . '/auth/google/register/callback')
            ->redirect();
    }

    public function handleGoogleRegisterCallback(Request $request): RedirectResponse
    {
        if (Auth::check()) {
            return redirect()->route('projects.index');
        }

        try {
            $socialUser = Socialite::driver('google')
                ->redirectUrl(config('app.url') . '/auth/google/register/callback')
                ->user();
        } catch (\Exception $e) {
            return redirect()->route('register')->withErrors([
                'oauth' => 'Google authentication failed. Please try again.',
            ]);
        }

        $isNewUser = false;

        $user = User::where('provider', 'google')
            ->where('provider_id', $socialUser->getId())
            ->orWhere('email', $socialUser->getEmail())
            ->first();

        if ($user) {
            $this->updateUserFromSocial($user, $socialUser, 'google');
        } else {
            $user = $this->createUserFromSocial($socialUser, 'google');
            $isNewUser = true;
        }

        Auth::login($user);

        $request->session()->regenerate();

        if ($isNewUser) {
            try {
                app(TelegramNotificationService::class)->notifyNewUserRegistration($user, 'google');
            } catch (\Throwable) {
            }

            return redirect()->route('user.questionnaire.create');
        }

        return redirect()->route('projects.index');
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private function createUserFromSocial($socialUser, string $provider): User
    {
        return User::create([
            'name' => $socialUser->getName() ?? $socialUser->getNickname() ?? 'User',
            'email' => $socialUser->getEmail(),
            'provider' => $provider,
            'provider_id' => $socialUser->getId(),
            'avatar' => $socialUser->getAvatar(),
            'email_verified_at' => now(),
        ]);
    }

    private function updateUserFromSocial(User $user, $socialUser, string $provider): void
    {
        $user->update([
            'provider' => $provider,
            'provider_id' => $socialUser->getId(),
            'avatar' => $socialUser->getAvatar(),
        ]);

        if (empty($user->name) || $user->name === 'User') {
            $user->update([
                'name' => $socialUser->getName() ?? $socialUser->getNickname() ?? $user->name,
            ]);
        }

        if (! $user->email_verified_at) {
            $user->update(['email_verified_at' => now()]);
        }
    }
}
