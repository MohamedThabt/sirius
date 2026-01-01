<?php

namespace App\Providers;

use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Laravel\Socialite\Facades\Socialite;
use SocialiteProviders\GitHub\Provider as GitHubProvider;
use SocialiteProviders\Google\Provider as GoogleProvider;
use SocialiteProviders\Manager\SocialiteWasCalled;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Force HTTPS in production when behind reverse proxy
        // This is a safety net in case X-Forwarded-Proto header is missing
        if (app()->environment('production')) {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

        // Register Socialite providers
        $this->bootSocialiteProviders();

        // Authorize Laravel Pulse access for admin guard only
        Gate::define('viewPulse', function () {
            return auth()->guard('admin')->check();
        });
    }

    /**
     * Bootstrap Socialite providers
     */
    private function bootSocialiteProviders(): void
    {
        // Listen for SocialiteWasCalled event to register providers
        \Event::listen(SocialiteWasCalled::class, function (SocialiteWasCalled $event) {
            $event->extendSocialite('github', GitHubProvider::class);
            $event->extendSocialite('google', GoogleProvider::class);
        });
    }
}
