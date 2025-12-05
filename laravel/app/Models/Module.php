<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Module extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'project_id',
        'name',
        'description',
        'metrics',
        'erd',
        'status',
        'order_of_implementation',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'status' => 'string',
        'order_of_implementation' => 'integer',
    ];

    /**
     * Get the project that owns the module.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the features for the module.
     */
    public function features(): HasMany
    {
        return $this->hasMany(Feature::class);
    }

    /**
     * Check if the module has an ERD generated.
     *
     * @return bool
     */
    public function hasErd(): bool
    {
        return !empty($this->erd);
    }

    /**
     * Get the count of features in this module.
     *
     * @return int
     */
    public function getFeaturesCountAttribute(): int
    {
        return $this->features()->count();
    }

    /**
     * Check if the module can generate features.
     * Features can only be generated if the module has an ERD.
     *
     * @return bool
     */
    public function canGenerateFeatures(): bool
    {
        return $this->hasErd();
    }
}
