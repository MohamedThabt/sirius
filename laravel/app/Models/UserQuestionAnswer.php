<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserQuestionAnswer extends Model
{
    use HasFactory;

    protected $table = 'user_question_answers';

    protected $fillable = [
        'user_id',
        'question',
        'answer',
    ];

    /**
     * Get the user that owns the questionnaire answer.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
