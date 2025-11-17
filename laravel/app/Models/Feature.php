<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Feature extends Model
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
        'summary',
        'priority',
        'status',
        'acceptance_criteria',
        'order_of_implementation',
        'user_flows',
        'metrics',
        'description',
        'erd',
        'sequence_diagram',
        'wireframe',
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
     * Get the project that owns the feature.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
