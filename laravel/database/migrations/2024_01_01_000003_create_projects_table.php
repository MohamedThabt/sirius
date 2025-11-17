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
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('brief')->nullable();
            $table->longText('prd')->nullable();
            $table->longText('non_functional_requirements')->nullable();
            $table->longText('technical_details')->nullable();
            $table->longText('erd')->nullable();
            $table->longText('c4')->nullable();
            $table->longText('brainstorming_scene')->nullable();
            $table->enum('status', ['draft', 'in_progress', 'completed', 'archived'])->default('in_progress');
            $table->timestamps();
            
            // Indexes for better performance
            $table->index(['user_id', 'status']);
            $table->index('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
