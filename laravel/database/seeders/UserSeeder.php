<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'user@example.com'],
            [
                'name' => 'Test User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // Ensure user has credits initialized
        if (!$user->credits) {
            $user->credits()->create([
                'credits_balance' => 1000,
                'total_this_month' => 1000,
                'billing_cycle_start' => now()->startOfMonth(),
            ]);
        }
    }
}
