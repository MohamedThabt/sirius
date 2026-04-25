<?php

namespace Database\Seeders;

use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class FreeTierUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $freePlan = Plan::query()->where('slug', 'free')->first();

        if (!$freePlan) {
            return;
        }

        $user = User::firstOrCreate(
            ['email' => 'free.user@example.com'],
            [
                'name' => 'Free Tier User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        $user->subscriptions()->updateOrCreate(
            ['plan_id' => $freePlan->id],
            [
                'status' => Subscription::STATUS_ACTIVE,
                'started_at' => now(),
                'ends_at' => null,
            ]
        );

        $user->credits()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'credits_balance' => $freePlan->credits_per_cycle,
                'total_this_month' => $freePlan->credits_per_cycle,
                'billing_cycle_start' => now()->startOfMonth(),
                'last_reset_at' => now(),
            ]
        );
    }
}
