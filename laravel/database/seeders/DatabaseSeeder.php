<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => '1@1.com'],
            [
                'name' => 'Moahmed',
                'password' => bcrypt('password'),
            ]
        );

        $this->call([
            PlanSeeder::class,
            AdminSeeder::class,
            ProjectWithFeaturesSeeder::class,
            ProjectTechnicalIntakeSeeder::class,
        ]);
    }
}
