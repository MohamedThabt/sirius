<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckCredits
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth()->user();

        if (!$user) {
            return $next($request);
        }

        $creditsBalance = $user->getCreditsBalance();

        if ($creditsBalance <= -50) {
            return response()->json([
                'message' => 'Credit limit reached. Please upgrade your plan or purchase additional credits.',
            ], 402);
        }

        return $next($request);
    }
}

