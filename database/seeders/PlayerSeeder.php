<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class PlayerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear 10 jugadores aleatorios
        User::factory()->count(15)->create([
            'role_id' => 3, // Player
        ]);

        // Crear un jugador de prueba fijo
        User::updateOrCreate(
            ['email' => 'player@test.com'],
            [
                'name' => 'Test Player',
                'password' => Hash::make('admin123'),
                'role_id' => 3,
            ]
        );
    }
}
