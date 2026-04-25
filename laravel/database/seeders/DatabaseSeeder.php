<?php

namespace Database\Seeders;

use App\Models\Plan;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed plans first
        $this->call([
            PlanSeeder::class,
            FreeTierUserSeeder::class,
            AdminSeeder::class,
            // ProjectWithFeaturesSeeder::class,
            // ProjectTechnicalIntakeSeeder::class,
        ]);

        // Create main user
        $user = User::firstOrCreate(
            ['email' => '1@1.com'],
            [
                'name' => 'Moahmed',
                'password' => bcrypt('password'),
            ]
        );

        // Ensure user has credits initialized (1000 credits)
        if (!$user->credits) {
            $user->credits()->create([
                'credits_balance' => 1000,
                'total_this_month' => 1000,
                'billing_cycle_start' => now()->startOfMonth(),
            ]);
        }

        // Ensure user has a subscription to the Pro plan
        if (!$user->subscriptions()->exists()) {
            $proPlan = Plan::where('slug', 'pro')->first();
            if ($proPlan) {
                $user->subscriptions()->create([
                    'plan_id' => $proPlan->id,
                    'status' => 'active',
                    'started_at' => now(),
                    'ends_at' => now()->addMonth(),
                ]);
            }
        }
    }
}
