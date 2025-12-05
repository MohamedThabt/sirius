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
        Schema::create('suggested_modules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->string('name')->comment('Summary/Title');
            $table->longText('description')->nullable()->comment('Strategic Definition');
            $table->longText('metrics')->nullable()->comment('Business KPIs');
            $table->integer('order_of_implementation')->default(0);
            $table->timestamps();

            $table->index('project_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('suggested_modules');
    }
};
