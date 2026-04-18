<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('game_emotion_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('game_id')->nullable()->constrained()->nullOnDelete();
            $table->string('emotion', 32); // happy, angry, sad, surprised, neutral, fearful, disgusted
            $table->float('confidence', 5, 4)->unsigned()->comment('0.0000 - 1.0000');
            $table->timestamp('detected_at')->useCurrent();
            $table->json('metadata')->nullable()->comment('Datos adicionales: intensity, duration_ms, etc');
            $table->timestamps();

            $table->index(['user_id', 'detected_at']);
            $table->index(['game_id', 'emotion']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('game_emotion_logs');
    }
};
