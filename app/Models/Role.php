<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $fillable = ['name'];
protected $hidden = ['created_at', 'updated_at'];
//public $timestamps = false; esto tambien vale lo dejo por si pasa algo
    public function users()
    {
        return $this->hasMany(User::class);
    }
}
