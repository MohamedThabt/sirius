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
        Schema::create('suggested_features', function (Blueprint $table) {
            $table->id();
            $table->foreignId('module_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->longText('summary')->nullable()->comment('Brief feature summary');
            $table->longText('description')->nullable()->comment('Detailed description');
            $table->longText('acceptance_criteria')->nullable();
            $table->longText('user_flows')->nullable();
            $table->longText('metrics')->nullable();
            $table->enum('priority', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->integer('order_of_implementation')->default(0);
            $table->timestamps();

            $table->index(['module_id', 'order_of_implementation']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('suggested_features');
    }
};
