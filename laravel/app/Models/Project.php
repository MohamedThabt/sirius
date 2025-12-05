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
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'brief',
        'prd',
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
    ];

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
