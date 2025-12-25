<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IssueComment extends Model
{
    use HasFactory;

    protected $table = 'issue_comments';

    /**
     * Indicates if the model should be timestamped.
     * This model only has created_at, no updated_at.
     */
    public $timestamps = false;

    protected $fillable = [
        'issue_report_id',
        'admin_id',
        'comment',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    /**
     * Get the issue report this comment belongs to.
     */
    public function issueReport(): BelongsTo
    {
        return $this->belongsTo(IssueReport::class);
    }

    /**
     * Get the admin who wrote the comment.
     */
    public function admin(): BelongsTo
    {
        return $this->belongsTo(Admin::class);
    }
}
