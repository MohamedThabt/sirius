<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckSuperAdmin
{
    /**
     * Handle an incoming request.
     *
     * Verify that the authenticated admin user has super admin privileges.
     * Aborts with 403 Forbidden if the user is not a super admin.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!auth('admin')->check() || !auth('admin')->user()->isSuperAdmin()) {
            abort(403, 'This action requires super administrator privileges.');
        }

        return $next($request);
    }
}
