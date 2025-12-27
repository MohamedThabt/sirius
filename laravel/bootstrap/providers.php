<?php

return array_filter([
    App\Providers\AppServiceProvider::class,
    // Only load Telescope in local environment with explicit TELESCOPE_ENABLED=true
    // Note: Using class_exists check prevents errors if Telescope is not installed
    (class_exists(\Laravel\Telescope\Telescope::class) && env('APP_ENV') === 'local' && env('TELESCOPE_ENABLED', false))
        ? App\Providers\TelescopeServiceProvider::class
        : null,
]);
