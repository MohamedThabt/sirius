<?php

namespace App\Services;

use App\Models\UsageLog;
use App\Models\User;
use App\Models\UserCredit;
use App\Support\AppLogger;
use Illuminate\Support\Facades\DB;

class AiUsageService
{
    public function handle(User $user, string $actionType, array $usage, ?string $model = null): void
    {
        $inputTokens = $usage['input_tokens'] ?? 0;
        $outputTokens = $usage['output_tokens'] ?? 0;
        $cost = $usage['cost'] ?? null;

        if ($inputTokens === 0 && $outputTokens === 0) {
            throw new \Exception('Invalid AI usage data: both input and output tokens are zero');
        }

        $totalTokens = $inputTokens + $outputTokens;

        // 1 credit = 1000 tokens
        $creditsUsed = (int) ceil($totalTokens / 1000);

        DB::transaction(function () use (
            $user,
            $actionType,
            $inputTokens,
            $outputTokens,
            $creditsUsed,
            $cost,
            $model
        ) {
            // Get or create UserCredit record
            $userCredit = UserCredit::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'credits_balance' => $user->plan?->monthly_credits ?? 0,
                    'total_this_month' => $user->plan?->monthly_credits ?? 0,
                    'billing_cycle_start' => now()->startOfMonth(),
                ]
            );

            // Decrement credits
            $userCredit->decrementCredits($creditsUsed);

            // Create usage log
            UsageLog::create([
                'user_id' => $user->id,
                'action_type' => $actionType,
                'model' => $model,
                'input_tokens' => $inputTokens,
                'output_tokens' => $outputTokens,
                'credits_used' => $creditsUsed,
                'cost' => $cost,
                'created_at' => now(),
            ]);

            $userCredit->refresh();
            AppLogger::business('credits.consumed', [
                'user_id' => $user->id,
                'credits_used' => $creditsUsed,
                'action_type' => $actionType,
                'model' => $model,
                'remaining_balance' => $userCredit->credits_balance,
            ]);
        });
    }
}

