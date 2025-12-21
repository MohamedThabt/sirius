<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserCredit extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'credits_balance',
        'total_this_month',
        'billing_cycle_start',
        'last_reset_at',
    ];

    protected function casts(): array
    {
        return [
            'credits_balance' => 'integer',
            'total_this_month' => 'integer',
            'billing_cycle_start' => 'date',
            'last_reset_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getDaysUntilReset(): int
    {
        $nextResetDate = $this->billing_cycle_start->copy()->addMonth()->startOfMonth();
        return max(0, now()->diffInDays($nextResetDate, false));
    }

    public function resetCredits(int $monthlyCredits): void
    {
        $this->update([
            'credits_balance' => $monthlyCredits,
            'total_this_month' => $monthlyCredits,
            'billing_cycle_start' => now()->startOfMonth(),
            'last_reset_at' => now(),
        ]);
    }

    public function incrementCredits(int $amount): void
    {
        $this->increment('credits_balance', $amount);
    }

    public function decrementCredits(int $amount): void
    {
        $this->decrement('credits_balance', $amount);
    }
}
