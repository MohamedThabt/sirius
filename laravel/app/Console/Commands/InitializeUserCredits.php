<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class InitializeUserCredits extends Command
{
    protected $signature = 'credits:initialize';

    protected $description = 'Initialize credits for users who don\'t have them';

    public function handle(): int
    {
        $this->info('Initializing user credits...');

        $users = User::with('plan', 'credits')->get();
        $initialized = 0;

        foreach ($users as $user) {
            if (!$user->credits && $user->plan) {
                $user->credits()->create([
                    'credits_balance' => $user->plan->monthly_credits,
                    'total_this_month' => $user->plan->monthly_credits,
                    'billing_cycle_start' => now()->startOfMonth(),
                    'last_reset_at' => now(),
                ]);
                
                $this->line("✓ Initialized credits for user: {$user->email}");
                $initialized++;
            }
        }

        if ($initialized === 0) {
            $this->info('No users needed credit initialization.');
        } else {
            $this->info("Successfully initialized credits for {$initialized} user(s).");
        }

        return Command::SUCCESS;
    }
}
