<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Plan::firstOrCreate(
            ['id' => 1],
            [
                'name' => 'Free',
                'slug' => 'free',
                'price' => 0.00,
                'credits_per_cycle' => 10,
                'billing_cycle' => 'monthly',
                'is_active' => true,
            ]
        );

        Plan::firstOrCreate(
            ['id' => 2],
            [
                'name' => 'Pro',
                'slug' => 'pro',
                'price' => 20.00,
                'credits_per_cycle' => 1000,
                'billing_cycle' => 'monthly',
                'is_active' => true,
            ]
        );
    }
}
