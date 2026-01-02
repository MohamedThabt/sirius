<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Project extends Model
{
    /** @use HasFactory<\Database\Factories\ProjectFactory> */
    use HasFactory;

    /**
     * Bootstrap the model and its traits.
     * 
     * Auto-complete project when progress reaches 100%.
     */
    protected static function booted(): void
    {
        static::saving(function (Project $project) {
            // Calculate progress before saving
            $progress = $project->progress;
            
            // Auto-set status to 'completed' when progress reaches 100%
            if ($progress === 100 && $project->status !== 'completed') {
                $project->status = 'completed';
            }
        });
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'brief',
        'prd',
        'prd_is_synced',
        'prd_last_synced_at',
        'non_functional_requirements',
        'technical_details',
        'erd',
        'c4',
        'brainstorming_scene',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'status' => 'string',
        'brainstorming_scene' => 'array',
        'prd_is_synced' => 'boolean',
        'prd_last_synced_at' => 'datetime',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = ['progress'];

    /**
     * Project progress fields for calculation.
     * Each field contributes equally to the overall progress.
     */
    private const PROGRESS_FIELDS = [
        'brief',
        'overview',
        'technical_details',
        'modules',
        'prd',
        'c4', // system architecture
    ];

    /**
     * Calculate project progress based on completed fields.
     * 
     * Fields considered (each ~16.67%):
     * - brief: Has content
     * - overview: Has latest overview version with content
     * - technical_details: Has content
     * - modules: All modules have progress === 100 (empty = 0%)
     * - prd: Has content
     * - c4: Has system architecture content
     *
     * @return int Progress percentage (0-100)
     */
    public function getProgressAttribute(): int
    {
        $completedCount = 0;
        $totalFields = count(self::PROGRESS_FIELDS);

        // Check brief
        if (!empty($this->brief)) {
            $completedCount++;
        }

        // Check overview (from latest overview version)
        $latestOverview = $this->latestOverviewVersion;
        if ($latestOverview && !empty($latestOverview->overview)) {
            $completedCount++;
        }

        // Check technical_details
        if (!empty($this->technical_details)) {
            $completedCount++;
        }

        // Check modules - all modules must have progress === 100
        // Empty modules = 0% (Option A)
        $modules = $this->modules;
        if ($modules->count() > 0) {
            $allModulesComplete = $modules->every(fn($module) => $module->progress === 100);
            if ($allModulesComplete) {
                $completedCount++;
            }
        }
        // If no modules, this field stays incomplete (0%)

        // Check PRD
        if (!empty($this->prd)) {
            $completedCount++;
        }

        // Check system architecture (c4)
        if (!empty($this->c4)) {
            $completedCount++;
        }

        return $totalFields > 0 ? (int) round(($completedCount / $totalFields) * 100) : 0;
    }

    /**
     * Get the user that owns the project.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the overview versions for the project.
     */
    public function overviewVersions(): HasMany
    {
        return $this->hasMany(ProjectOverviewVersion::class);
    }

    /**
     * Get the base overview version for the project.
     */
    public function baseOverviewVersion()
    {
        return $this->hasOne(ProjectOverviewVersion::class)->where('is_base_version', true);
    }

    /**
     * Get the latest overview version for the project.
     */
    public function latestOverviewVersion()
    {
        return $this->hasOne(ProjectOverviewVersion::class)->latest('version_number');
    }

    /**
     * Get the modules for the project.
     */
    public function modules(): HasMany
    {
        return $this->hasMany(Module::class)->orderBy('order_of_implementation');
    }

    /**
     * Get all features for the project through modules.
     */
    public function features(): HasManyThrough
    {
        return $this->hasManyThrough(Feature::class, Module::class);
    }

    /**
     * Get the suggested modules for the project (AI-generated cache).
     */
    public function suggestedModules(): HasMany
    {
        return $this->hasMany(SuggestedModule::class)->orderBy('order_of_implementation');
    }

    /**
     * Get the technical intake for the project.
     */
    public function technicalIntake(): HasOne
    {
        return $this->hasOne(ProjectTechnicalIntake::class);
    }

    /**
     * Get the repository for the project.
     */
    public function repository(): HasOne
    {
        return $this->hasOne(ProjectRepository::class);
    }

    /**
     * Get all team members for the project (accepted invitations only).
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_user')
            ->withPivot('role', 'joined_at')
            ->withTimestamps();
    }

    /**
     * Get all invitations for the project.
     */
    public function invitations(): HasMany
    {
        return $this->hasMany(ProjectInvitation::class);
    }

    /**
     * Get pending invitations for the project.
     */
    public function pendingInvitations(): HasMany
    {
        return $this->hasMany(ProjectInvitation::class)->where('status', ProjectInvitation::STATUS_PENDING);
    }

    /**
     * Get all project_user pivot records.
     */
    public function projectUsers(): HasMany
    {
        return $this->hasMany(ProjectUser::class);
    }

    /**
     * Get the owner of the project.
     */
    public function owner()
    {
        return $this->members()->wherePivot('role', ProjectUser::ROLE_OWNER)->first() ?? $this->user;
    }

    /**
     * Check if a user is the owner of the project.
     */
    public function isOwner(int $userId): bool
    {
        // First check the legacy user_id field
        if ($this->user_id === $userId) {
            return true;
        }
        
        // Then check the project_user table
        return $this->members()
            ->wherePivot('role', ProjectUser::ROLE_OWNER)
            ->where('users.id', $userId)
            ->exists();
    }

    /**
     * Check if a user is a member of the project.
     */
    public function hasMember(int $userId): bool
    {
        // Owner is always a member
        if ($this->user_id === $userId) {
            return true;
        }
        
        return $this->members()->where('users.id', $userId)->exists();
    }

    /**
     * Get the role of a user in the project.
     */
    public function getMemberRole(int $userId): ?string
    {
        // Check legacy owner
        if ($this->user_id === $userId) {
            return ProjectUser::ROLE_OWNER;
        }
        
        $member = $this->members()->where('users.id', $userId)->first();
        return $member?->pivot->role;
    }

    /**
     * Add a member to the project.
     */
    /**
     * Add a member to the project.
     */
    public function addMember(int $userId, string $role = ProjectUser::ROLE_VIEWER): void
    {
        if (!$this->hasMember($userId)) {
            $this->members()->attach($userId, [
                'role' => $role,
                'joined_at' => now(),
            ]);
        }
    }

    /**
     * Invite a user to the project (creates a pending invitation).
     */
    public function inviteMember(int $userId, string $role, int $invitedBy): ProjectInvitation
    {
        // Check if user is already a member
        if ($this->hasMember($userId)) {
            throw new \Exception('User is already a member of this project.');
        }

        // Check if user already has a pending invitation
        $existingInvitation = $this->invitations()
            ->where('user_id', $userId)
            ->where('status', ProjectInvitation::STATUS_PENDING)
            ->first();

        if ($existingInvitation) {
            throw new \Exception('User already has a pending invitation.');
        }

        // Create invitation
        return $this->invitations()->create([
            'user_id' => $userId,
            'invited_by' => $invitedBy,
            'role' => $role,
            'status' => ProjectInvitation::STATUS_PENDING,
            'invited_at' => now(),
        ]);
    }
}
