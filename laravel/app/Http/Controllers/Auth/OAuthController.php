<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
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
        // If already authenticated, redirect to projects
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

    /**
     * Redirect to Google OAuth
     */
    public function redirectToGoogle(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle Google OAuth callback
     */
    public function handleGoogleCallback(Request $request): RedirectResponse
    {
        // If already authenticated, redirect to projects
        if (Auth::check()) {
            return redirect()->intended(route('projects.index'));
        }

        try {
            $socialUser = Socialite::driver('google')->user();
        } catch (\Exception $e) {
            return redirect()->route('login')->withErrors([
                'oauth' => 'Google authentication failed. Please try again.',
            ]);
        }

        $user = $this->findOrCreateUser($socialUser, 'google');

        Auth::login($user);

        $request->session()->regenerate();

        return redirect()->intended(route('projects.index'));
    }

    /**
     * Find or create user from OAuth data
     */
    private function findOrCreateUser($socialUser, string $provider)
    {
        // First, try to find by provider and provider_id
        $user = User::where('provider', $provider)
            ->where('provider_id', $socialUser->getId())
            ->first();

        if ($user) {
            // Update user data if found by provider ID
            $this->updateUserFromSocial($user, $socialUser, $provider);

            return $user;
        }

        // If not found by provider ID, check by email for auto-merge
        $user = User::where('email', $socialUser->getEmail())->first();

        if ($user) {
            // Auto-merge: Update existing user with OAuth data
            $this->updateUserFromSocial($user, $socialUser, $provider);

            return $user;
        }

        // Create new user
        return $this->createUserFromSocial($socialUser, $provider);
    }

    /**
     * Create new user from OAuth data
     */
    private function createUserFromSocial($socialUser, string $provider)
    {
        return User::create([
            'name' => $socialUser->getName() ?? $socialUser->getNickname() ?? 'User',
            'email' => $socialUser->getEmail(),
            'provider' => $provider,
            'provider_id' => $socialUser->getId(),
            'avatar' => $socialUser->getAvatar(),
            'email_verified_at' => now(), // OAuth emails are considered verified
        ]);
    }

    /**
     * Update existing user with OAuth data
     */
    private function updateUserFromSocial(User $user, $socialUser, string $provider)
    {
        $user->update([
            'provider' => $provider,
            'provider_id' => $socialUser->getId(),
            'avatar' => $socialUser->getAvatar(),
        ]);

        // Update name if it's empty or generic
        if (empty($user->name) || $user->name === 'User') {
            $user->update([
                'name' => $socialUser->getName() ?? $socialUser->getNickname() ?? $user->name,
            ]);
        }

        // Mark email as verified if not already
        if (! $user->email_verified_at) {
            $user->update(['email_verified_at' => now()]);
        }
    }
}
