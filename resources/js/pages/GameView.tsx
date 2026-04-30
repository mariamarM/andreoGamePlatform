import { useState, useEffect, useRef } from 'react';
import GameChat from '@/components/MisComponentes/GameChat';

interface GameViewProps {
    game: {
        id: number;
        title: string;
        url: string;
    };
    user: {
        id: number;
        name: string;
        email: string;
    };
    messages?: Array<{
        id: number;
        user: string;
        message: string;
    }>;
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: '#0a0a0a',
        position: 'relative',
    },

    header: {
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        padding: '15px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '2px solid #00d4ff',
        position: 'relative',
        zIndex: 10,
    },

    emotionCamera: {
        position: 'absolute',
        top: '20px',
        right: '20px',
        width: '200px',
        height: '150px',
        background: '#000',
        border: '2px solid #00d4ff',
        borderRadius: '12px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#00d4ff',
        fontSize: '14px',
        zIndex: 20,
    },

    emotionCameraVideo: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },

    emotionCameraOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: '16px',
        textAlign: 'center',
        padding: '10px',
    },

    emotionCameraStatus: {
        marginTop: '10px',
        fontSize: '12px',
        opacity: 0.8,
    },

    statsSection: {
        display: 'flex',
        gap: '30px',
        alignItems: 'center',
    },

    statItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },

    statLabel: {
        fontSize: '11px',
        color: '#00d4ff',
        textTransform: 'uppercase',
        letterSpacing: '1px',
    },

    statValue: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#fff',
    },

    gameSection: {
        flex: 1,
        background: '#000',
        overflow: 'hidden',
    },

    iframe: {
        width: '100%',
        height: '100%',
        border: 'none',
    },

    chatSection: {
        background: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)',
        height: '250px',
        display: 'flex',
        flexDirection: 'column',
        borderTop: '2px solid #00d4ff',
    },

    chatHeader: {
        padding: '10px 20px',
        borderBottom: '1px solid rgba(0,212,255,0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },

    chatTitle: {
        fontSize: '14px',
        color: '#00d4ff',
        fontWeight: 'bold',
        margin: 0,
    },

    chatBody: {
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
    },

    input: {
        width: '100%',
        padding: '12px 15px',
        background: 'rgba(0,0,0,0.5)',
        border: '1px solid rgba(0,212,255,0.3)',
        borderRadius: '8px',
        color: '#fff',
        fontSize: '14px',
        outline: 'none',
    },

    button: {
        padding: '12px 25px',
        background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
        border: 'none',
        borderRadius: '8px',
        color: '#000',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '14px',
        transition: 'all 0.3s ease',
    },

    inputGroup: {
        display: 'flex',
        gap: '10px',
        padding: '15px 20px',
    },
};

export default function GameView({ game, user }: GameViewProps) {
    const [score, setScore] = useState<number>(0);
    const [savedScore, setSavedScore] = useState<number | null>(null);
    const [emotion, setEmotion] = useState<string>('neutral');
    const [confidence, setConfidence] = useState<number>(0);
    const [isDetecting, setIsDetecting] = useState<boolean>(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const guardarPuntuacion = async () => {
        try {
            const token = (
                document.querySelector(
                    'meta[name="csrf-token"]',
                ) as HTMLMetaElement
            ).content;

            const res = await fetch('/api/game-sessions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': token,
                },
                body: JSON.stringify({
                    game_id: game.id,
                    score: score,
                }),
            });

            const data = await res.json();

            if (data.success) {
                setSavedScore(data.session.score);
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Start emotion detection
    useEffect(() => {
        const startEmotionDetection = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setIsDetecting(true);
                
                // Simulate emotion detection (in a real app, this would use a ML model)
                const detectEmotion = async () => {
                    if (!isDetecting) return;
                    
                    // Simulate random emotions for demo purposes
                    const emotions = ['happy', 'sad', 'angry', 'surprised', 'neutral', 'fearful', 'disgusted'];
                    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
                    const randomConfidence = Math.random() * 0.4 + 0.6; // 0.6 to 1.0
                    
                    setEmotion(randomEmotion);
                    setConfidence(randomConfidence);
                    
                    // Send emotion data to API
                    try {
                        const token = (
                            document.querySelector(
                                'meta[name="csrf-token"]',
                            ) as HTMLMetaElement
                        ).content;
                        
                        await fetch('/api/game/emotion', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': token,
                            },
                            body: JSON.stringify({
                                emotion: randomEmotion,
                                confidence: randomConfidence,
                                game_id: game.id,
                                detected_at: new Date().toISOString(),
                            }),
                        });
                    } catch (error) {
                        console.error('Error sending emotion data:', error);
                    }
                    
                    // Schedule next detection
                    setTimeout(detectEmotion, 3000); // Detect every 3 seconds
                };
                
                detectEmotion();
            } catch (err) {
                console.error('Error accessing camera:', err);
                setIsDetecting(false);
            }
        };

        startEmotionDetection();

        // Cleanup on unmount
        return () => {
            setIsDetecting(false);
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [game.id, isDetecting]);

    return (
        <div style={styles.container}>
            {/* HEADER con Stats */}
            <div style={styles.header}>
                <h1 style={{ color: '#fff', margin: 0, fontSize: '20px' }}>
                    {game.title}
                </h1>
                <div style={styles.statsSection}>
                    <div style={styles.statItem}>
                        <span style={styles.statLabel}>Puntuación</span>
                        <span style={styles.statValue}>
                            {savedScore ?? '—'}
                        </span>
                    </div>
                    <div style={styles.statItem}>
                        <span style={styles.statLabel}>Jugador</span>
                        <span style={{ color: '#fff', fontSize: '16px' }}>
                            {user.name}
                        </span>
                    </div>
                </div>
                <input
                    type="number"
                    placeholder="Puntuación"
                    value={score}
                    onChange={(e) => setScore(Number(e.target.value))}
                    style={styles.input}
                />
                <button onClick={guardarPuntuacion} style={styles.button}>
                    Guardar
                </button>
            </div>

            {/* EMOTION CAMERA */}
            <div style={styles.emotionCamera}>
                {!isDetecting ? (
                    <div>
                        <div>Cámara de Emociones</div>
                        <div className={styles.emotionCameraStatus}>Haciendo clic para iniciar</div>
                    </div>
                ) : (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            style={styles.emotionCameraVideo}
                        />
                        <div style={styles.emotionCameraOverlay}>
                            <div>Emoción detectada: {emotion}</div>
                            <div>Confianza: {(confidence * 100).toFixed(1)}%</div>
                            <div className={styles.emotionCameraStatus}>
                                {isDetecting ? 'Detectando...' : 'Detenido'}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* JUEGO */}
            <div style={styles.gameSection}>
                <iframe src={game.url} style={styles.iframe} allowFullScreen />
            </div>

            {/* CHAT */}
            <div style={styles.chatSection}>
                <div style={styles.chatHeader}>
                    <h3 style={styles.chatTitle}>Chat de Jugadores</h3>
                </div>
                <div style={styles.chatBody}>
                    <GameChat messages={messages || []} />
                </div>
            </div>
        </div>
    );
}
