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
            $table->foreignId('module_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->longText('summary')->nullable();
            $table->longText('description')->nullable();
            $table->longText('acceptance_criteria')->nullable();
            $table->longText('user_flows')->nullable();
            $table->longText('wireframe')->nullable();
            $table->longText('sequence_diagram')->nullable();
            $table->longText('datamodel')->nullable();
            $table->longText('metrics')->nullable();
            $table->enum('priority', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->enum('status', ['draft', 'todo', 'in_progress', 'review', 'done'])->default('draft');
            $table->integer('order_of_implementation')->nullable();
            $table->timestamps();

            $table->index(['module_id', 'status']);
            $table->index('priority');
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