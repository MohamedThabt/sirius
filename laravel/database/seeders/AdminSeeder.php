<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Admin::firstOrCreate(
            ['email' => 'thabet@example.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'role' => Admin::ROLE_SUPER_ADMIN,
                'created_by' => null,
            ]
        );
    }
}
