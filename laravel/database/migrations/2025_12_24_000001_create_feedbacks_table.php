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
        Schema::create('feedbacks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['suggestion', 'ux', 'confusion']);
            $table->text('message');
            $table->string('page_url');
            $table->enum('status', ['new', 'reviewed', 'planned', 'done'])->default('new');
            $table->text('internal_notes')->nullable();
            $table->unsignedInteger('upvotes')->default(0);
            $table->timestamps();

            $table->index('status');
            $table->index('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('feedbacks');
    }
};
