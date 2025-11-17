<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('project_technical_intakes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->text('platform_targets')->nullable();
            $table->text('frontend_tech')->nullable();
            $table->text('backend_tech')->nullable();
            $table->text('database_tech')->nullable();
            $table->text('ai_usage')->nullable();
            $table->text('external_services')->nullable();
            $table->timestamps();

            // Indexes for better performance
            $table->index('project_id');
            
            // Unique constraint to ensure one technical intake per project
            $table->unique('project_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_technical_intakes');
    }
};
