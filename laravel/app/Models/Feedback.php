<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Feedback extends Model
{
    use HasFactory;

    protected $table = 'feedbacks';

    // Type constants
    const TYPE_SUGGESTION = 'suggestion';
    const TYPE_UX = 'ux';
    const TYPE_CONFUSION = 'confusion';

    // Status constants
    const STATUS_NEW = 'new';
    const STATUS_REVIEWED = 'reviewed';
    const STATUS_PLANNED = 'planned';
    const STATUS_DONE = 'done';

    protected $fillable = [
        'user_id',
        'type',
        'message',
        'page_url',
        'status',
        'internal_notes',
        'upvotes',
    ];

    protected $casts = [
        'upvotes' => 'integer',
    ];

    /**
     * Get the user who submitted the feedback.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all votes for this feedback.
     */
    public function votes(): HasMany
    {
        return $this->hasMany(FeedbackVote::class);
    }

    /**
     * Increment the upvotes count.
     */
    public function incrementUpvotes(): void
    {
        $this->increment('upvotes');
    }

    /**
     * Decrement the upvotes count.
     */
    public function decrementUpvotes(): void
    {
        $this->decrement('upvotes');
    }
}
