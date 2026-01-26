<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {

        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $user = $request->user();
        $admin = $request->user('admin');
        
        // Load relationships for authenticated user (not admin)
        if ($user && $user instanceof \App\Models\User) {
            try {
                $user->load('credits');
                $activePlan = $user->activePlan();
                
                // Load plan relationship for frontend access (auth.user.plan)
                if ($activePlan) {
                    $user->setRelation('plan', $activePlan);
                }
                
                // Initialize credits if they don't exist and user has a plan
                if ($activePlan && is_null($user->credits)) {
                    try {
                        $user->credits()->create([
                            'credits_balance' => $activePlan->credits_per_cycle,
                            'total_this_month' => $activePlan->credits_per_cycle,
                            'billing_cycle_start' => now()->startOfMonth(),
                            'last_reset_at' => now(),
                        ]);
                        $user->refresh();
                    } catch (\Exception $e) {
                        Log::error('Failed to create user credits: ' . $e->getMessage());
                    }
                }
            } catch (\Exception $e) {
                Log::error('Failed to load user relationships in HandleInertiaRequests: ' . $e->getMessage(), [
                    'user_id' => $user->id,
                    'exception' => $e,
                ]);
            }
        }
        
        // Build user credits data (only for User model, not Admin)
        $userCredits = null;
        $activePlan = $user && $user instanceof \App\Models\User ? $user->activePlan() : null;
        if ($user && $user instanceof \App\Models\User && $activePlan && $user->credits) {
            $rawBalance = $user->getCreditsBalance();
            $balance = max(0, $rawBalance); // Ensure never negative
            $total = $user->getTotalThisMonth();
            $used = max(0, $total - $rawBalance);
            
            $userCredits = [
                'balance' => $balance,
                'total' => $total,
                'used' => $used,
                'percentage' => $total > 0 
                    ? round(min(($used / $total) * 100, 100), 1) // Cap at 100%
                    : 0,
                'daysUntilReset' => $user->credits->getDaysUntilReset(),
            ];
        }
        
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $user,
                'admin' => $admin,
            ],
            'userCredits' => $userCredits,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'warning' => $request->session()->get('warning'),
                'info' => $request->session()->get('info'),
            ],
            'creditLimitReached' => $request->session()->get('creditLimitReached'),
            'creditsBalance' => $request->session()->get('creditsBalance'),
        ];
    }
}
