<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SuggestedFeature extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'suggested_features';

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
        'metrics',
        'priority',
        'order_of_implementation',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'priority' => 'string',
        'order_of_implementation' => 'integer',
    ];

    /**
     * Get the module that owns the suggested feature.
     */
    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }
}
