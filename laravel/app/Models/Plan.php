<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Plan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'price',
        'credits_per_cycle',
        'billing_cycle',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'credits_per_cycle' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get all subscriptions for this plan.
     */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    /**
     * Get users with active subscriptions to this plan.
     */
    public function activeSubscribers(): HasManyThrough
    {
        return $this->hasManyThrough(User::class, Subscription::class, 'plan_id', 'id', 'id', 'user_id')
            ->where('subscriptions.status', Subscription::STATUS_ACTIVE);
    }

    /**
     * Get the count of active subscribers.
     */
    public function getActiveSubscribersCountAttribute(): int
    {
        return $this->activeSubscribers()->count();
    }
}
