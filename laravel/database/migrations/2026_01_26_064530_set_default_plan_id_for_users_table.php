<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Ensure Free plan exists before updating users
        $freePlanExists = DB::table('plans')->where('id', 1)->exists();
        
        if (!$freePlanExists) {
            DB::table('plans')->insert([
                'id' => 1,
                'name' => 'Free',
                'monthly_price' => 0.00,
                'monthly_credits' => 10,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Update existing users with null plan_id to Free plan (id: 1)
        DB::table('users')
            ->whereNull('plan_id')
            ->update(['plan_id' => 1]);

        // Set default value to 1 (Free plan) for plan_id column
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('plan_id')->default(1)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('plan_id')->nullable()->change();
        });
    }
};
