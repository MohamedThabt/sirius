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
        Schema::create('modules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->longText('description')->nullable();
            $table->longText('metrics')->nullable();
            $table->longText('erd')->nullable();
            $table->enum('status', ['planned', 'in_progress', 'completed'])->default('planned');
            $table->integer('order_of_implementation')->default(0);
            $table->timestamps();

            // Indexes for better performance
            $table->index(['project_id', 'status']);
            $table->index('order_of_implementation');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('modules');
    }
};
