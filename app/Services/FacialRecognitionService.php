<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FacialRecognitionService
{
    protected string $serviceUrl;

    protected int $timeout;

    public function __construct()
    {
        $this->serviceUrl = rtrim(env('FACIAL_SERVICE_URL'), '/');
        $this->timeout = env('FACIAL_SERVICE_TIMEOUT', 60);
    }

    /**
     * Compara dos imágenes faciales y devuelve si coinciden.
     *
     * @param  string  $imagePath1  Ruta absoluta de la primera imagen (registro)
     * @param  string  $imagePath2  Ruta absoluta de la segunda imagen (webcam)
     * @return array ['match' => bool, 'confidence' => float|null, 'error' => string|null]
     */
    public function verifyFaces(string $imagePath1, string $imagePath2): array
    {
        try {
            if (! file_exists($imagePath1) || ! file_exists($imagePath2)) {
                return [
                    'match' => false,
                    'confidence' => null,
                    'error' => 'Una o ambas imágenes no existen en el servidor.',
                ];
            }

            $response = Http::timeout($this->timeout)
                ->attach('img1', file_get_contents($imagePath1), 'registro.jpg')
                ->attach('img2', file_get_contents($imagePath2), 'webcam.jpg')
                ->post($this->serviceUrl); // Removido /verify extra

            if (! $response->successful()) {
                Log::warning('Facial service error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return [
                    'match' => false,
                    'confidence' => null,
                    'error' => 'Error del servicio facial: HTTP '.$response->status(),
                ];
            }

            $result = $response->json();

            // El servicio puede devolver: { "match": true, "confidence": 0.95 }
            return [
                'match' => (bool) ($result['match'] ?? false),
                'confidence' => $result['confidence'] ?? null,
                'error' => null,
            ];

        } catch (ConnectionException $e) {
            Log::error('Facial service connection failed', ['exception' => $e->getMessage()]);

            return [
                'match' => false,
                'confidence' => null,
                'error' => 'No se pudo conectar con el servicio de reconocimiento facial.',
            ];
        } catch (\Throwable $e) {
            Log::error('Facial service unexpected error', ['exception' => $e->getMessage()]);

            return [
                'match' => false,
                'confidence' => null,
                'error' => 'Error inesperado en el servicio facial.',
            ];
        }
    }

    /**
     * Envía solo metadatos de emociones al backend (sin biometría).
     * Este método es para frontend que ya procesó la imagen localmente.
     *
     * @param  array  $emotionData  ['emotion' => string, 'confidence' => float, 'game_id' => int|null]
     * @return array ['success' => bool]
     */
    public function sendEmotionData(array $emotionData): array
    {
        // Este método simplemente valida; el endpoint real será POST /api/game/emotion
        // Se deja como placeholder para futura extensibilidad (ej. enriquecer datos antes de guardar)
        return ['success' => true];
    }
}
