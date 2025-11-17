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
        Schema::create('project_overview_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->longText('overview');
            $table->integer('version_number');
            $table->boolean('is_base_version')->default(false);
            $table->text('user_prompt')->nullable();
            $table->timestamps();
            
            // Indexes for better performance
            $table->index(['project_id', 'version_number']);
            $table->index(['project_id', 'is_base_version']);
            $table->unique(['project_id', 'version_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_overview_versions');
    }
};
