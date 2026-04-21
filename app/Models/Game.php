<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    protected $fillable = [
    'title',
    'description',
    'is_published',
    'url',
    'user_id',
];
public function user()
{
    return $this->belongsTo(User::class);
}
public function sessions()
{
    return $this->hasMany(GameSession::class);
}
}
