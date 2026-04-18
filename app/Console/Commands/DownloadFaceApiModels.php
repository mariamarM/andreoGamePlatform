<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class DownloadFaceApiModels extends Command
{
    protected $signature = 'face-api:download-models';

    protected $description = 'Descarga los modelos de face-api.js (tinyFaceDetector + faceExpressionNet) a public/models';

    protected const MODELS = [
        'tiny_face_detector_model-weights_manifest.json',
        'tiny_face_detector_model-shard1',
        'face_expression_model-weights_manifest.json',
        'face_expression_model-shard1',
    ];

    protected const BASE_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

    public function handle(): int
    {
        $this->info('Descargando modelos de face-api.js...');

        $disk = 'public';
        $targetDir = 'models';
        if (! Storage::disk($disk)->exists($targetDir)) {
            Storage::disk($disk)->makeDirectory($targetDir);
        }

        $success = 0;
        foreach (self::MODELS as $file) {
            $url = self::BASE_URL.'/'.$file;
            $this->info("Descargando: {$file}");

            try {
                $response = Http::timeout(30)->get($url);
                if ($response->successful()) {
                    Storage::disk($disk)->put("{$targetDir}/{$file}", $response->body());
                    $this->info("  ✓ Guardado en storage/app/public/{$targetDir}/{$file}");
                    $success++;
                } else {
                    $this->error("  ✗ Error HTTP: {$response->status()}");
                }
            } catch (\Throwable $e) {
                $this->error("  ✗ Error: {$e->getMessage()}");
            }
        }

        $this->info("Completado: {$success}/".count(self::MODELS).' modelos descargados.');
        $this->info('Asegúrate de ejecutar: php artisan storage:link');

        return self::SUCCESS;
    }
}
