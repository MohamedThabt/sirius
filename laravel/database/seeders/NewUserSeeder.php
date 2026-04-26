<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class NewUserSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'mohamed.work.thatbet@gmail.com'],
            [
                'name' => 'John Doe',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        if (!$user->credits) {
            $user->credits()->create([
                'credits_balance' => 1000,
                'total_this_month' => 1000,
                'billing_cycle_start' => now()->startOfMonth(),
            ]);
        }
    }
}