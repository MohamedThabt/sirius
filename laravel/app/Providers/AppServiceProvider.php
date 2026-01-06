<?php

namespace App\Providers;

use App\Listeners\HandleEmailBounced;
use App\Listeners\HandleEmailComplained;
use App\Listeners\HandleEmailDelivered;
use App\Listeners\HandleEmailFailed;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Laravel\Socialite\Facades\Socialite;
use Resend\Laravel\Events\EmailBounced;
use Resend\Laravel\Events\EmailComplained;
use Resend\Laravel\Events\EmailDelivered;
use Resend\Laravel\Events\EmailFailed;
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

        // Register Resend webhook event listeners
        $this->bootResendEventListeners();

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
        Event::listen(SocialiteWasCalled::class, function (SocialiteWasCalled $event) {
            $event->extendSocialite('github', GitHubProvider::class);
            $event->extendSocialite('google', GoogleProvider::class);
        });
    }

    /**
     * Bootstrap Resend webhook event listeners
     */
    private function bootResendEventListeners(): void
    {
        Event::listen(EmailDelivered::class, HandleEmailDelivered::class);
        Event::listen(EmailBounced::class, HandleEmailBounced::class);
        Event::listen(EmailFailed::class, HandleEmailFailed::class);
        Event::listen(EmailComplained::class, HandleEmailComplained::class);
    }
}
