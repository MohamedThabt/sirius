<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectOverviewVersion extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'project_id',
        'overview',
        'version_number',
        'is_base_version',
        'user_prompt',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_base_version' => 'boolean',
        'version_number' => 'integer',
    ];

    /**
     * Get the project that owns the overview version.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

   
}
