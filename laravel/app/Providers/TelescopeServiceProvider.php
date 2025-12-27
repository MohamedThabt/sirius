<?php

namespace App\Providers;

use Illuminate\Support\Facades\Gate;
use Laravel\Telescope\IncomingEntry;
use Laravel\Telescope\Telescope;
use Laravel\Telescope\TelescopeApplicationServiceProvider;

class TelescopeServiceProvider extends TelescopeApplicationServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Telescope::night();

        $this->hideSensitiveRequestDetails();

        $isLocal = $this->app->environment('local');
        $isEnabled = config('telescope.enabled', false);

            Telescope::filter(function (IncomingEntry $entry) use ($isLocal, $isEnabled) {
            if ($isLocal) {
                return true;
            }

            if (!$isEnabled) {
                return false;
            }

            return true;
        });
    }

    /**
     * Prevent sensitive request details from being logged by Telescope.
     */
    protected function hideSensitiveRequestDetails(): void
    {
        if ($this->app->environment('local')) {
            return;
        }

        Telescope::hideRequestParameters(['_token']);

        Telescope::hideRequestHeaders([
            'cookie',
            'x-csrf-token',
            'x-xsrf-token',
        ]);
    }

    /**
     * Register the Telescope gate.
     *
     * This gate determines who can access Telescope in non-local environments.
     */
    protected function gate(): void
    {
        Gate::define('viewTelescope', function ($user) {
            $allowedEmails = array_filter(explode(',', env('TELESCOPE_ALLOWED_EMAILS', '')));
            
            if (empty($allowedEmails)) {
                return true;
            }

            return in_array($user->email, $allowedEmails);
        });
    }
}
