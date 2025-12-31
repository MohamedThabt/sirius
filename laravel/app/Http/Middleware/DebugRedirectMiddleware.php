<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class DebugRedirectMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        // #region agent log
        Log::info('[DEBUG-REDIRECT] Request entering', [
            'hypothesisId' => 'B',
            'path' => $request->path(),
            'method' => $request->method(),
            'scheme' => $request->getScheme(),
            'is_secure' => $request->isSecure(),
            'x_forwarded_proto' => $request->header('X-Forwarded-Proto'),
            'x_forwarded_host' => $request->header('X-Forwarded-Host'),
            'x_forwarded_port' => $request->header('X-Forwarded-Port'),
            'host' => $request->getHost(),
            'full_url' => $request->fullUrl(),
            'app_url' => config('app.url'),
            'session_driver' => config('session.driver'),
            'session_secure' => config('session.secure'),
            'trust_proxies' => config('trustedproxy.proxies'),
        ]);
        // #endregion

        $response = $next($request);

        // #region agent log
        Log::info('[DEBUG-REDIRECT] Response leaving', [
            'hypothesisId' => 'C',
            'path' => $request->path(),
            'status_code' => $response->getStatusCode(),
            'is_redirect' => $response->isRedirect(),
            'redirect_location' => $response->headers->get('Location'),
            'response_class' => get_class($response),
        ]);
        // #endregion

        return $response;
    }
}

