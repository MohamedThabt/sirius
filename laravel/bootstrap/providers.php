<?php

return array_filter([
    App\Providers\AppServiceProvider::class,
    env('TELESCOPE_ENABLED', false) ? App\Providers\TelescopeServiceProvider::class : null,
]);
