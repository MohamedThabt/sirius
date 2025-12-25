<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class IssueReport extends Model
{
    use HasFactory;

    protected $table = 'issue_reports';

    // Severity constants
    const SEVERITY_LOW = 'low';
    const SEVERITY_MEDIUM = 'medium';
    const SEVERITY_HIGH = 'high';
    const SEVERITY_BLOCKER = 'blocker';

    // Status constants
    const STATUS_OPEN = 'open';
    const STATUS_INVESTIGATING = 'investigating';
    const STATUS_FIXED = 'fixed';
    const STATUS_WONT_FIX = 'wont_fix';

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'steps',
        'expected',
        'actual',
        'severity',
        'status',
        'page_url',
        'screenshot_path',
        'meta',
    ];

    protected $casts = [
        'meta' => 'array',
    ];

    /**
     * Get the user who reported the issue.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all comments for this issue.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(IssueComment::class);
    }
}
