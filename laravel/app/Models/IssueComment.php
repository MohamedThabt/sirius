<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IssueComment extends Model
{
    use HasFactory;

    protected $table = 'issue_comments';

    protected $fillable = [
        'issue_report_id',
        'admin_id',
        'comment',
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
