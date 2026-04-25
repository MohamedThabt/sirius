<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\UsageLog;
use App\Models\UserCredit;
use App\Support\AppLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class UsageController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();
        $user->load('credits');
        $activePlan = $user->activePlan();
        $activeSubscription = $user->activeSubscription();

        // Get or create UserCredit if doesn't exist
        $userCredits = $user->credits ?? UserCredit::create([
            'user_id' => $user->id,
            'credits_balance' => $activePlan?->credits_per_cycle ?? 0,
            'total_this_month' => $activePlan?->credits_per_cycle ?? 0,
            'billing_cycle_start' => now()->startOfMonth(),
        ]);

        // Check and reset credits if needed
        $this->checkAndResetCredits($user, $userCredits);

        // Refresh credits after potential reset
        $userCredits->refresh();

        // Calculate credit statistics
        $totalCredits = $userCredits->total_this_month ?: ($activePlan?->credits_per_cycle ?? 0);
        $remainingCredits = max(0, $userCredits->credits_balance); // Ensure never negative
        $usedCredits = max(0, $totalCredits - $userCredits->credits_balance);
        $percentageUsed = $totalCredits > 0 ? ($usedCredits / $totalCredits) * 100 : 0;
        $daysUntilReset = $userCredits->getDaysUntilReset();

        // Get usage graph data (last 30 days)
        $graphData = $this->getUsageGraphData($user->id);

        // Get usage logs (paginated)
        $usageLogs = UsageLog::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        // Calculate total consumed credits
        $totalConsumedCredits = UsageLog::where('user_id', $user->id)
            ->where('action_type', '!=', 'credit_purchase')
            ->sum('credits_used');

        return Inertia::render('settings/usage', [
            'credits' => [
                'total' => $totalCredits,
                'remaining' => $remainingCredits,
                'used' => $usedCredits,
                'percentage_used' => round(min($percentageUsed, 100), 1), // Cap at 100%
                'days_until_reset' => $daysUntilReset,
            ],
            'plan' => $activePlan ? [
                'name'  => $activePlan->name,
                'slug'  => $activePlan->slug,
                'price' => $activePlan->price,
            ] : null,
            'subscription' => $activeSubscription ? [
                'id' => $activeSubscription->id,
                'status' => $activeSubscription->status,
                'started_at' => $activeSubscription->started_at,
                'ends_at' => $activeSubscription->ends_at,
            ] : null,
            'graphData' => $graphData,
            'usageLogs' => $usageLogs,
            'totalConsumedCredits' => $totalConsumedCredits,
        ]);
    }

    public function purchaseCredits(Request $request)
    {
        $validated = $request->validate([
            'credits_package' => 'required|in:250',
        ]);

        $user = auth()->user();
        $user->load('credits');
        $activePlan = $user->activePlan();

        // Credit package pricing
        $packages = [
            '250' => ['credits' => 250, 'price' => 5.00],
        ];

        $package = $packages[$validated['credits_package']];

        // TODO: Integrate with payment gateway (Stripe, PayPal, etc.)
        // For now, we'll simulate successful payment

        DB::transaction(function () use ($user, $package, $activePlan) {
            // Get or create UserCredit record
            $userCredits = $user->credits ?? UserCredit::create([
                'user_id' => $user->id,
                'credits_balance' => $activePlan?->credits_per_cycle ?? 0,
                'total_this_month' => $activePlan?->credits_per_cycle ?? 0,
                'billing_cycle_start' => now()->startOfMonth(),
            ]);

            // Increment credits
            $userCredits->incrementCredits($package['credits']);

            // Log purchase
            UsageLog::create([
                'user_id' => $user->id,
                'action_type' => 'credit_purchase',
                'model' => null,
                'input_tokens' => 0,
                'output_tokens' => 0,
                'credits_used' => -$package['credits'], // Negative to represent addition
                'cost' => $package['price'],
                'created_at' => now(),
            ]);
        });

        AppLogger::business('credits.purchase.completed', [
            'user_id' => $user->id,
            'credits' => $package['credits'],
            'amount' => $package['price'],
        ]);

        return back()->with('success', "Successfully purchased {$package['credits']} credits for \${$package['price']}!");
    }

    protected function checkAndResetCredits($user, UserCredit $userCredits): void
    {
        $nextResetDate = $userCredits->billing_cycle_start->copy()->addMonth()->startOfMonth();

        if (now()->greaterThanOrEqualTo($nextResetDate)) {
            $activePlan = $user->activePlan();
            $creditsPerCycle = $activePlan?->credits_per_cycle ?? 0;

            $userCredits->resetCredits($creditsPerCycle);

            // Optional: Log reset for audit trail
            UsageLog::create([
                'user_id' => $user->id,
                'action_type' => 'credits_reset',
                'model' => null,
                'input_tokens' => 0,
                'output_tokens' => 0,
                'credits_used' => 0,
                'cost' => null,
                'created_at' => now(),
            ]);
        }
    }

    protected function getUsageGraphData(int $userId): array
    {
        $startDate = now()->subDays(30)->startOfDay();
        $endDate = now()->endOfDay();

        $logs = UsageLog::where('user_id', $userId)
            ->where('created_at', '>=', $startDate)
            ->where('created_at', '<=', $endDate)
            ->where('action_type', '!=', 'credit_purchase')
            ->selectRaw('DATE(created_at) as date, SUM(credits_used) as credits')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Fill in missing dates with 0
        $data = [];
        $currentDate = $startDate->copy();

        while ($currentDate->lte($endDate)) {
            $dateStr = $currentDate->format('Y-m-d');
            $log = $logs->firstWhere('date', $dateStr);
            $data[] = [
                'date' => $dateStr,
                'credits' => $log ? (int) $log->credits : 0,
            ];
            $currentDate->addDay();
        }

        return $data;
    }
}
