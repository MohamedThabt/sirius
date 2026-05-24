<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Plan;
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
            ['email' => 'mohamedthabetthabet36@gmail.com'],
            [
                'name' => 'Mohamed Thabet',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // Ensure user has credits initialized
        if (!$user->credits) {
            $user->credits()->create([
                'credits_balance' => 2000,
                'total_this_month' => 2000,
                'billing_cycle_start' => now()->startOfMonth(),
            ]);
        }

        // Generate the seeder context for this user specifically
        $this->call(UserProjectSeeder::class);
    }
}
