<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Game;
use App\Models\User;

class GameSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get a user to assign as the creator (assuming at least one user exists)
        $user = User::first();

        if (!$user) {
            // If no users exist, we can't create games that require a user_id
            // You might want to create a default user here, but for now we'll skip.
            return;
        }

        // Sample games data
        $games = [
            [
                'title' => 'Tamagotchi React',
                'description' => 'Un juego virtual de mascotas donde crias y cuidas a tu Tamagotchi.',
                'url' => 'https://tamagotchi-react.vercel.app/',
                'is_published' => true,
                'user_id' => $user->id,
            ],
            [
                'title' => 'Juego de Puzzles',
                'description' => 'Un desafiante juego de puzzles que pone a prueba tu lógica.',
                'url' => 'https://example.com/puzzle-game',
                'is_published' => true,
                'user_id' => $user->id,
            ],
            [
                'title' => 'Aventura Épica',
                'description' => 'Embárcate en una aventura épica llena de misterios y tesoros.',
                'url' => 'https://example.com/epic-adventure',
                'is_published' => true,
                'user_id' => $user->id,
            ],
        ];

        // Insert each game
        foreach ($games as $gameData) {
            Game::create($gameData);
        }
    }
}