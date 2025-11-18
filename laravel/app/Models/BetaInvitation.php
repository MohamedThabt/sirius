<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BetaInvitation extends Model
{
    use HasFactory;

    const STATUS_PENDING = 'pending';
    const STATUS_APPROVED = 'approved';
    const STATUS_DENIED = 'denied';

    protected $fillable = [
        'name',
        'email',
        'status',
        'note',
        'invited_by',
        'approved_at',
    ];

    protected function casts(): array
    {
        return [
            'approved_at' => 'datetime',
        ];
    }

    /**
     * Get the admin who invited this user.
     */
    public function invitedBy(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'invited_by');
    }

    /**
     * Check if invitation is pending.
     */
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Check if invitation is approved.
     */
    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    /**
     * Check if invitation is denied.
     */
    public function isDenied(): bool
    {
        return $this->status === self::STATUS_DENIED;
    }
}
