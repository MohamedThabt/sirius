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
            if ($request->wantsJson() || $request->inertia()) {
                return response()->json([
                    'message' => 'Unauthenticated.',
                ], 401);
            }
            return redirect()->route('login');
        }

        if (!$user->credits) {
            if ($request->wantsJson() || $request->inertia()) {
                return response()->json([
                    'message' => 'Credits not initialized. Please contact support.',
                ], 500);
            }
            return back()->with('error', 'Credits not initialized. Please contact support.');
        }

        $creditsBalance = $user->getCreditsBalance();

        if ($creditsBalance <= -50) {
            AppLogger::business('credits.limit_reached', [
                'user_id' => $user->id,
                'balance' => $creditsBalance,
                'route' => $request->route()->getName(),
            ], 'warning');

            return back()->with([
                'error' => 'Credit limit reached. Please upgrade your plan or purchase additional credits.',
                'creditLimitReached' => true,
                'creditsBalance' => $creditsBalance,
            ]);
        }

        if ($creditsBalance < 10 && $creditsBalance > -50) {
            AppLogger::business('credits.low_balance', [
                'user_id' => $user->id,
                'balance' => $creditsBalance,
                'route' => $request->route()->getName(),
            ], 'info');
        }

        return $next($request);
    }
}

