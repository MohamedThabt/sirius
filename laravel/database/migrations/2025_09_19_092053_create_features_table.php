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
        Schema::create('features', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->longText('summary');
            $table->enum('priority', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->enum('status', ['draft', 'in_progress', 'completed', 'archived'])->default('in_progress');
            $table->longText('acceptance_criteria')->nullable();
            $table->integer('order_of_implementation')->default(0);
            $table->string('user_flows')->nullable();
            $table->longText('metrics')->nullable();
            $table->longText('description')->nullable();
            $table->longText('erd')->nullable();
            $table->longText('sequence_diagram')->nullable();
            $table->longText('wireframe')->nullable();
            $table->timestamps();

            $table->index(['project_id', 'order_of_implementation']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('features');
    }
};
