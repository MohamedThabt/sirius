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
     * Bootstrap the model and its traits.
     */
    protected static function booted(): void
    {
        // Automatically set status to 'completed' when progress reaches 100%
        static::saving(function (Feature $feature) {
            // Calculate progress manually here to avoid recursion issues
            $completed = 0;
            $total = count(self::ARTIFACT_FIELDS);

            foreach (self::ARTIFACT_FIELDS as $field) {
                if (!empty($feature->$field)) {
                    $completed++;
                }
            }

            $progress = $total > 0 ? (int) round(($completed / $total) * 100) : 0;

            // Auto-complete feature when progress reaches 100%
            if ($progress === 100 && $feature->status !== 'done') {
                $feature->status = 'done';
            }
        });

        // Update parent module status after feature is saved
        static::saved(function (Feature $feature) {
            if ($feature->module) {
                $feature->module->updateModuleStatus();
                $feature->module->saveQuietly(); // Save without triggering events
            }
        });

        // Update parent module status after feature is deleted
        static::deleted(function (Feature $feature) {
            if ($feature->module) {
                $feature->module->updateModuleStatus();
                $feature->module->saveQuietly(); // Save without triggering events
            }
        });
    }

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

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<string>
     */
    protected $appends = ['progress'];

    /**
     * Feature artifact fields used for progress calculation.
     * These represent the completable aspects of a feature.
     *
     * @var array<string>
     */
    public const ARTIFACT_FIELDS = [
        'summary',
        'description',
        'acceptance_criteria',
        'user_flows',
        'metrics',
        'datamodel',
        'sequence_diagram',
        'wireframe',
    ];

    /**
     * Get the feature's completion progress (0-100).
     * Progress is calculated based on how many artifact fields are filled.
     *
     * @return int
     */
    public function getProgressAttribute(): int
    {
        $completed = 0;
        $total = count(self::ARTIFACT_FIELDS);

        foreach (self::ARTIFACT_FIELDS as $field) {
            if (!empty($this->$field)) {
                $completed++;
            }
        }

        return $total > 0 ? (int) round(($completed / $total) * 100) : 0;
    }

    /**
     * Check if the feature is fully complete (100% progress).
     *
     * @return bool
     */
    public function isComplete(): bool
    {
        return $this->progress === 100;
    }
}
