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
        Schema::create('project_repositories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->string('provider')->default('github');
            $table->string('repo_id')->nullable();
            $table->string('name');
            $table->string('full_name');
            $table->string('owner_login');
            $table->string('owner_type'); // 'user' or 'org'
            $table->string('default_branch')->default('main');
            $table->string('html_url')->nullable();
            $table->string('ssh_url')->nullable();
            $table->string('visibility')->default('private'); // 'public' or 'private'
            $table->text('error_message')->nullable();
            $table->timestamp('synced_at')->nullable();
            $table->timestamps();
            
            $table->unique('project_id');
            $table->index(['provider', 'repo_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_repositories');
    }
};
