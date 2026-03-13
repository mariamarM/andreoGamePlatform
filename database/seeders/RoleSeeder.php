<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        //las ids no las pones porque como lo hace automatico osea ya sabe que id segun el orden que hay poner
        Role::create(['name' => 'admin']);
        Role::create(['name' => 'gestor']);
        Role::create(['name' => 'usuario']);
    }
}
