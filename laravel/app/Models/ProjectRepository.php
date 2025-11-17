<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectRepository extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'project_id',
        'provider',
        'repo_id',
        'name',
        'full_name',
        'owner_login',
        'owner_type',
        'default_branch',
        'html_url',
        'ssh_url',
        'visibility',
        'error_message',
        'synced_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'synced_at' => 'datetime',
    ];

    /**
     * Get the project that owns the repository.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Check if the repository has been synced successfully.
     */
    public function isSynced(): bool
    {
        return !is_null($this->synced_at) && is_null($this->error_message);
    }
}
