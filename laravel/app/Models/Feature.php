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
        'module_id',
        'name',
        'description',
        'acceptance_criteria',
        'user_flows',
        'wireframe',
        'sequence_diagram',
        'datamodel',
        'priority',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'priority' => 'string',
        'status' => 'string',
    ];

    /**
     * Get the module that owns the feature.
     */
    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }


}
