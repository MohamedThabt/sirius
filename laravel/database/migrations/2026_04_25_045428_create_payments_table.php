<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('plan_slug')->default('pro');
            $table->decimal('amount', 10, 2)->default(200.00);
            $table->string('currency', 10)->default('EGP');
            $table->string('payment_method')->default('instapay');
            $table->string('transfer_image_path');
            $table->enum('status', ['pending', 'accepted', 'denied'])->default('pending');
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
