<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class Feature extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'module_id',
        'name',
        'summary',
        'description',
        'acceptance_criteria',
        'user_flows',
        'wireframe',
        'sequence_diagram',
        'datamodel',
        'metrics',
        'priority',
        'status',
        'order_of_implementation',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'priority' => 'string',
        'status' => 'string',
        'order_of_implementation' => 'integer',
    ];

    /**
     * Get the module that owns the feature.
     */
    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }

    /**
     * Scope a query to filter features by their module's status.
     *
     * @param Builder $query
     * @param string|array $status Module status (planned, in_progress, completed)
     * @return Builder
     */
    public function scopeWhereModuleStatus(Builder $query, string|array $status): Builder
    {
        return $query->whereHas('module', function (Builder $query) use ($status) {
            $query->whereIn('status', is_array($status) ? $status : [$status]);
        });
    }

    /**
     * Scope a query to order features by their implementation order.
     *
     * @param Builder $query
     * @param string $direction
     * @return Builder
     */
    public function scopeOrderByImplementation(Builder $query, string $direction = 'asc'): Builder
    {
        return $query->orderBy('order_of_implementation', $direction);
    }
}
