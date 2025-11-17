<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectTechnicalIntake extends Model
{
    protected $fillable = [
        'project_id',
        'platform_targets',
        'frontend_tech',
        'backend_tech',
        'database_tech',
        'ai_usage',
        'external_services',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
