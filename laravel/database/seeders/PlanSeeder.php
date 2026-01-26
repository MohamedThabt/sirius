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
                'monthly_price' => 0.00,
                'monthly_credits' => 10,
            ]
        );

        Plan::firstOrCreate(
            ['id' => 2],
            [
                'name' => 'Pro',
                'monthly_price' => 20.00,
                'monthly_credits' => 100,
            ]
        );
    }
}
