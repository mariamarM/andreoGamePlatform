<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GameEmotionLog extends Model
{
    protected $fillable = [
        'user_id',
        'game_id',
        'emotion',
        'confidence',
        'detected_at',
        'metadata',
    ];

    protected $casts = [
        'confidence' => 'decimal:4',
        'detected_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class);
    }
}
