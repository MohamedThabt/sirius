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
     * Bootstrap the model and its traits.
     * 
     * Auto-update module status based on features and progress.
     */
    protected static function booted(): void
    {
        static::saving(function (Module $module) {
            // Update status based on features before saving
            $module->updateModuleStatus();
        });
    }

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
        'erd_is_synced',
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
        'erd_is_synced' => 'boolean',
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

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<string>
     */
    protected $appends = ['progress'];

    /**
     * Module aspect weights for progress calculation.
     * Each aspect contributes equally (25%) to total progress.
     * 
     * Aspects:
     * - Description: Considered complete if non-empty (filled at creation)
     * - Metrics (Success Metrics): Considered complete if non-empty (filled at creation)
     * - ERD (Database Schema): Considered complete if any ERD text exists
     * - Features: Only counts features that are 100% complete
     */
    public const PROGRESS_ASPECTS = [
        'description',
        'metrics',
        'erd',
        'features',
    ];

    /**
     * Get the module's completion progress (0-100).
     * 
     * Progress calculation:
     * - Description: 25% if non-empty
     * - Metrics: 25% if non-empty
     * - ERD: 25% if any ERD text exists (partial credit)
     * - Features: 25% based on ratio of fully-complete features
     *
     * @return int
     */
    public function getProgressAttribute(): int
    {
        $aspectCount = count(self::PROGRESS_ASPECTS);
        $aspectValue = 100 / $aspectCount; // Each aspect is worth 25%
        $totalProgress = 0;

        // Description: 25% if non-empty
        if (!empty($this->description)) {
            $totalProgress += $aspectValue;
        }

        // Metrics (Success Metrics): 25% if non-empty
        if (!empty($this->metrics)) {
            $totalProgress += $aspectValue;
        }

        // ERD (Database Schema): 25% if any ERD text exists
        if (!empty($this->erd)) {
            $totalProgress += $aspectValue;
        }

        // Features: 25% based on ratio of fully-complete features (100% progress)
        $features = $this->relationLoaded('features') 
            ? $this->features 
            : $this->features()->get();
        
        $totalFeatures = $features->count();
        
        if ($totalFeatures > 0) {
            // Only count features that are 100% complete
            $completedFeatures = $features->filter(function ($feature) {
                return $feature->progress === 100;
            })->count();
            
            $featureRatio = $completedFeatures / $totalFeatures;
            $totalProgress += $aspectValue * $featureRatio;
        }
        // If no features exist, the features aspect contributes 0%

        return (int) round($totalProgress);
    }

    /**
     * Get detailed progress breakdown for the module.
     * Useful for displaying aspect-level completion status.
     *
     * @return array{percentage: int, aspects: array{description: bool, metrics: bool, erd: bool, features_ratio: float, features_complete: int, features_total: int}}
     */
    public function getProgressDetailsAttribute(): array
    {
        $features = $this->relationLoaded('features') 
            ? $this->features 
            : $this->features()->get();
        
        $totalFeatures = $features->count();
        $completedFeatures = $totalFeatures > 0 
            ? $features->filter(fn ($f) => $f->progress === 100)->count() 
            : 0;

        return [
            'percentage' => $this->progress,
            'aspects' => [
                'description' => !empty($this->description),
                'metrics' => !empty($this->metrics),
                'erd' => !empty($this->erd),
                'features_ratio' => $totalFeatures > 0 ? $completedFeatures / $totalFeatures : 0,
                'features_complete' => $completedFeatures,
                'features_total' => $totalFeatures,
            ],
        ];
    }

    /**
     * Update the module status based on features.
     * 
     * Status logic:
     * - 'planned': Module has no features yet
     * - 'in_progress': Module has at least one feature
     * - 'completed': All features are 100% complete
     * 
     * Note: This is called automatically during model saving.
     * Manual status changes are allowed but may be overridden by this logic.
     * 
     * @return void
     */
    public function updateModuleStatus(): void
    {
        // Load features if not already loaded
        if (!$this->relationLoaded('features')) {
            $this->load('features');
        }

        $features = $this->features;
        $featureCount = $features->count();

        // No features = planned
        if ($featureCount === 0) {
            $this->status = 'planned';
            return;
        }

        // Check if all features are 100% complete
        $allFeaturesComplete = $features->every(function ($feature) {
            return $feature->progress === 100;
        });

        if ($allFeaturesComplete) {
            $this->status = 'completed';
        } else {
            $this->status = 'in_progress';
        }
    }
}
