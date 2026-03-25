<?php

namespace Database\Seeders;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Seeder;
use App\Models\User;
class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Admin (role_id = 1)
        User::create([
            'name' => 'Admin',
            'email' => 'admin@test.com',
            'password' => Hash::make('admin123'),
            'role_id' => 1
        ]);

        // Gestor (role_id = 2)
        User::create([
            'name' => 'Gestor',
            'email' => 'gestor@test.com',
            'password' => Hash::make('admin123'),
            'role_id' => 2
        ]);

        // Player (role_id = 3)
        User::create([
            'name' => 'Player',
            'email' => 'player@test.com',
            'password' => Hash::make('admin123'),
            'role_id' => 3
        ]);
    }
}
