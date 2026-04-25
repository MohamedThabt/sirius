<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Boot the model.
     */
    protected static function booted(): void
    {
        static::created(function (User $user) {
            // Assign Free plan (id: 1) on registration
            if (!$user->subscriptions()->exists()) {
                \App\Models\Subscription::create([
                    'user_id' => $user->id,
                    'plan_id' => 1, // Free plan
                    'status' => \App\Models\Subscription::STATUS_ACTIVE,
                    'started_at' => now(),
                ]);

                \App\Models\UserCredit::create([
                    'user_id' => $user->id,
                    'credits_balance' => 100,
                    'total_this_month' => 100,
                    'billing_cycle_start' => now()->startOfMonth(),
                ]);
            }
        });
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'provider',
        'provider_id',
        'avatar',
        'email_verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the projects for the user.
     */
    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    /**
     * Get all projects where the user is a team member.
     */
    public function teamProjects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'project_user')
            ->withPivot('role', 'joined_at')
            ->withTimestamps();
    }

    /**
     * Get pending project invitations for the user.
     */
    public function pendingProjectInvitations(): HasMany
    {
        return $this->hasMany(ProjectInvitation::class, 'user_id')
            ->where('status', ProjectInvitation::STATUS_PENDING)
            ->with(['project', 'inviter']);
    }

    /**
     * Get all project invitations for the user.
     */
    public function projectInvitations(): HasMany
    {
        return $this->hasMany(ProjectInvitation::class, 'user_id');
    }

    /**
     * Get all project_user pivot records.
     */
    public function projectUsers(): HasMany
    {
        return $this->hasMany(ProjectUser::class);
    }

    /**
     * Get projects owned by the user (where role is owner in project_user table).
     */
    public function ownedProjects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'project_user')
            ->wherePivot('role', ProjectUser::ROLE_OWNER)
            ->withPivot('role', 'joined_at')
            ->withTimestamps();
    }

    /**
     * Get projects where the user is collaborating (not owner).
     */
    public function collaboratingProjects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'project_user')
            ->wherePivotIn('role', [ProjectUser::ROLE_ADMIN, ProjectUser::ROLE_DEVELOPER, ProjectUser::ROLE_VIEWER])
            ->withPivot('role', 'joined_at')
            ->withTimestamps();
    }

    /**
     * Get the role of the user in a specific project.
     */
    public function getProjectRole(int $projectId): ?string
    {
        $project = $this->teamProjects()->where('projects.id', $projectId)->first();
        return $project?->pivot->role;
    }

    /**
     * Get the GitHub token for the user.
     */
    public function githubToken(): HasOne
    {
        return $this->hasOne(GithubToken::class);
    }

    /**
     * Get all subscriptions for the user.
     */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    /**
     * Get the active subscription for the user.
     */
    public function activeSubscription(): ?Subscription
    {
        return $this->subscriptions()
            ->where('status', Subscription::STATUS_ACTIVE)
            ->with('plan')
            ->first();
    }

    /**
     * Get the active plan for the user.
     */
    public function activePlan(): ?Plan
    {
        return $this->activeSubscription()?->plan;
    }

    /**
     * Get the plan relationship (for backward compatibility with frontend).
     * This is an alias for activePlan() to support auth.user.plan access.
     */
    public function getPlanAttribute(): ?Plan
    {
        try {
            return $this->activePlan();
        } catch (\Exception $e) {
            \Log::error('Failed to get plan attribute: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Get the credits for the user.
     */
    public function credits(): HasOne
    {
        return $this->hasOne(UserCredit::class);
    }

    /**
     * Get the usage logs for the user.
     */
    public function usageLogs(): HasMany
    {
        return $this->hasMany(UsageLog::class);
    }

    /**
     * Get the current credits balance.
     */
    public function getCreditsBalance(): int
    {
        return $this->credits?->credits_balance ?? 0;
    }

    /**
     * Get the total credits for this month.
     */
    public function getTotalThisMonth(): int
    {
        return $this->credits?->total_this_month ?? ($this->activePlan()?->credits_per_cycle ?? 0);
    }

    /**
     * Get the feedbacks submitted by the user.
     */
    public function feedbacks(): HasMany
    {
        return $this->hasMany(Feedback::class);
    }

    /**
     * Get the issue reports submitted by the user.
     */
    public function issueReports(): HasMany
    {
        return $this->hasMany(IssueReport::class);
    }

    /**
     * Get the feedback votes by the user.
     */
    public function feedbackVotes(): HasMany
    {
        return $this->hasMany(FeedbackVote::class);
    }
}
