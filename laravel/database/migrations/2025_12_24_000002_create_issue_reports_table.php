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
        Schema::create('issue_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description');
            $table->text('steps')->nullable();
            $table->text('expected')->nullable();
            $table->text('actual')->nullable();
            $table->enum('severity', ['low', 'medium', 'high', 'blocker'])->default('medium');
            $table->enum('status', ['open', 'investigating', 'fixed', 'wont_fix'])->default('open');
            $table->string('page_url')->nullable();
            $table->string('screenshot_path')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('severity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('issue_reports');
    }
};
