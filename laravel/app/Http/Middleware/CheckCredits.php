<?php

namespace App\Http\Middleware;

use App\Support\AppLogger;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckCredits
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth()->user();

        if (!$user) {
            return $next($request);
        }

        $creditsBalance = $user->getCreditsBalance();

        if ($creditsBalance <= -50) {
            AppLogger::business('credits.limit_reached', [
                'user_id' => $user->id,
                'balance' => $creditsBalance,
            ], 'warning');

            return response()->json([
                'message' => 'Credit limit reached. Please upgrade your plan or purchase additional credits.',
            ], 402);
        }

        return $next($request);
    }
}

