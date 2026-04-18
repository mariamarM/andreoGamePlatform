import { useEffect, useRef, useState, useCallback } from 'react';
import * as faceapi from 'face-api.js';

interface EmotionData {
    emotion: string;
    confidence: number;
    timestamp: number;
}

interface EmotionDetectorProps {
    /** Callback invocado cada vez que se detecta una emoción */
    onEmotionDetected: (data: EmotionData) => void;
    /** Intervalo de detección en milisegundos (default: 500ms) */
    detectionInterval?: number;
    /** ID del juego actual (opcional, se asocia a los logs) */
    gameId?: number;
    /** Habilitar/deshabilitar el detector */
    enabled?: boolean;
}

/**
 * EmotionDetector
 *
 * Componente que accede a la webcam, detecta rostros y emociones localmente
 * usando face-api.js (TensorFlow.js). No envía imágenes al servidor.
 *
 * Flujo de privacidad:
 *   1. Webcam → Video element (hidden)
 *   2. face-api.js → Canvas/Tensor (en memoria)
 *   3. Solo se envía al backend: { emotion, confidence, game_id }  ← datos abstractos
 *
 * Cumple con GDPR: no se transmiten biométricos (píxeles, embeddings).
 */
export default function EmotionDetector({
    onEmotionDetected,
    detectionInterval = 500,
    gameId,
    enabled = true,
}: EmotionDetectorProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isActive, setIsActive] = useState(false);

    // Cargar modelos de face-api.js desde /models/ (deberás copiarlos a public/models/)
    useEffect(() => {
        let mounted = true;

        async function loadModels() {
            try {
                // Modelos requeridos: TinyFaceDetector + FaceExpressionNet
                const MODEL_URL = '/models';

                await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
                await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);

                if (mounted) {
                    setIsLoading(false);
                }
            } catch (err) {
                console.error('Error loading face-api models:', err);
                if (mounted) {
                    setError(
                        'No se pudieron cargar los modelos de detección facial.',
                    );
                }
            }
        }

        loadModels();

        return () => {
            mounted = false;
        };
    }, []);

    // Iniciar webcam when enabled becomes true
    useEffect(() => {
        if (!enabled || isLoading || error) return;

        let stream: MediaStream | null = null;
        let intervalId: NodeJS.Timeout;

        async function startWebcam() {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 320, height: 240, facingMode: 'user' },
                    audio: false,
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();

                    // Esperar a que el video tenga dimensiones
                    await new Promise<void>((resolve) => {
                        if (videoRef.current!.videoWidth > 0) {
                            resolve();
                        } else {
                            videoRef.current!.onloadedmetadata = () =>
                                resolve();
                        }
                    });

                    setIsActive(true);
                }
            } catch (err: any) {
                console.error('Webcam access denied:', err);
                setError(
                    'No se pudo acceder a la cámara. Verifica los permisos.',
                );
            }
        }

        function stopWebcam() {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
                stream = null;
            }
            if (intervalId) {
                clearInterval(intervalId);
            }
            setIsActive(false);
        }

        startWebcam();

        // Detección periódica
        intervalId = setInterval(async () => {
            if (
                !videoRef.current ||
                videoRef.current.paused ||
                videoRef.current.ended
            )
                return;

            try {
                const detections = await faceapi
                    .detectSingleFace(
                        videoRef.current,
                        new faceapi.TinyFaceDetectorOptions(),
                    )
                    .withFaceExpressions();

                if (detections) {
                    const expressions = detections.expressions;
                    // Determinar emoción dominante
                    const emotion = Object.keys(expressions).reduce((a, b) =>
                        expressions[a] > expressions[b] ? a : b,
                    );
                    const confidence = expressions[emotion];

                    // Solo notificar si confianza supera umbral (evitar falsos positivos)
                    if (confidence >= 0.5) {
                        onEmotionDetected({
                            emotion,
                            confidence,
                            timestamp: Date.now(),
                        });
                    }
                }
            } catch (err) {
                console.error('Emotion detection error:', err);
            }
        }, detectionInterval);

        return () => {
            stopWebcam();
        };
    }, [enabled, isLoading, error, detectionInterval, onEmotionDetected]);

    // El video es oculto (no se muestra al usuario)
    return (
        <div className="hidden">
            <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                style={{ width: 320, height: 240 }}
            />
            {isLoading && <div>Cargando modelos de IA...</div>}
            {error && <div className="text-red-500">{error}</div>}
        </div>
    );
}
