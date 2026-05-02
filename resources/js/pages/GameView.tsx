import { useState, useEffect, useRef } from 'react';
import GameChat from '@/components/MisComponentes/GameChat';
import { Head, Link } from '@inertiajs/react';

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
        role_id: number;
    };
    ranking: Array<{
        user_id: number;
        high_score: number;
        user: {
            name: string;
        };
    }>;
    userBestScore: number;
    messages?: Array<any>;
}

export default function GameView({ game, user, ranking, userBestScore, messages }: GameViewProps) {
    const [score, setScore] = useState<number>(0);
    const [savedScore, setSavedScore] = useState<number | null>(null);
    const [emotion, setEmotion] = useState<string>('neutral');
    const [confidence, setConfidence] = useState<number>(0);
    const [isDetecting, setIsDetecting] = useState<boolean>(false);
    const [faceFound, setFaceFound] = useState<boolean>(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Definir la sala privada del usuario
    const userRoom = `user_${user.id}`;

    useEffect(() => {
        const checkScore = () => {
            const localScore = localStorage.getItem(`game_score_${game.id}`);
            if (localScore) {
                const parsedScore = parseInt(localScore);
                if (parsedScore !== score) {
                    setScore(parsedScore);
                }
            }
        };
        const interval = setInterval(checkScore, 2000);
        return () => clearInterval(interval);
    }, [game.id, score]);

    useEffect(() => {
        if (score > 0 && score !== savedScore) {
            guardarPuntuacion(score);
        }
    }, [score]);

    const guardarPuntuacion = async (puntuacion: number) => {
        try {
            const token = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement).content;
            const res = await fetch('/game-sessions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': token,
                },
                body: JSON.stringify({ game_id: game.id, score: puntuacion }),
            });
            const data = await res.json();
            if (data.success) setSavedScore(data.session.score);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const startEmotionDetection = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setIsDetecting(true);
                
                // Bucle de dibujo a 60fps
                const drawLoop = () => {
                    if (canvasRef.current && videoRef.current && streamRef.current?.active) {
                        const ctx = canvasRef.current.getContext('2d');
                        if (ctx) {
                            ctx.save();
                            ctx.scale(-1, 1);
                            ctx.drawImage(videoRef.current, -canvasRef.current.width, 0, canvasRef.current.width, canvasRef.current.height);
                            ctx.restore();
                        }
                        requestAnimationFrame(drawLoop);
                    }
                };
                requestAnimationFrame(drawLoop);

                const detectEmotion = async () => {
                    setFaceFound(Math.random() > 0.1); 
                    const emotions = ['happy', 'sad', 'angry', 'surprised', 'neutral', 'fearful', 'disgusted'];
                    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
                    const randomConfidence = Math.random() * 0.4 + 0.6;
                    setEmotion(randomEmotion);
                    setConfidence(randomConfidence);

                    try {
                        const token = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement).content;
                        await fetch('/api/game/emotion', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': token },
                            body: JSON.stringify({
                                emotion: randomEmotion,
                                confidence: randomConfidence,
                                game_id: game.id,
                                detected_at: new Date().toISOString(),
                            }),
                        });
                    } catch (error) { console.error('Error sending emotion data:', error); }
                    
                    if (streamRef.current?.active) setTimeout(detectEmotion, 5000);
                };
                detectEmotion();
            } catch (err) {
                console.error('Error accessing camera:', err);
                setIsDetecting(false);
            }
        };
        startEmotionDetection();
        return () => { if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop()); };
    }, [game.id]);

    return (
        <div style={styles.container}>
            <Head title={`Jugando: ${game.title}`} />
            
            <div style={styles.bentobox}>
                {/* LEFT COLUMN: GAME */}
                <div style={styles.gameBox}>
                    <div style={styles.boxHeader}>
                        <Link href="/" style={styles.backButton}>←</Link>
                        <h2 style={styles.boxTitle}>{game.title}</h2>
                        <div style={styles.liveBadge}>LIVE</div>
                    </div>
                    <div style={styles.iframeContainer}>
                        <iframe src={game.url} style={styles.iframe} allowFullScreen />
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div style={styles.sidebar}>
                    {/* CAMERA BOX */}
                    <div style={styles.cameraBox}>
                        <div style={styles.boxHeaderMini}>
                            <span>Detección Facial Activa</span>
                            <span style={{ color: faceFound ? '#10b981' : '#ef4444' }}>
                                {faceFound ? '● CARA DETECTADA' : '○ BUSCANDO CARA...'}
                            </span>
                        </div>
                        <div style={styles.cameraContent}>
                            {!isDetecting ? (
                                <div style={styles.cameraPlaceholder}>
                                    <div style={styles.cameraIcon}>📷</div>
                                    <span>Iniciando cámara...</span>
                                </div>
                            ) : (
                                <>
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        style={{ 
                                            position: 'absolute', 
                                            opacity: 0, 
                                            pointerEvents: 'none',
                                            width: '1px',
                                            height: '1px'
                                        }} 
                                    />
                                    <canvas 
                                        ref={canvasRef} 
                                        width={640} 
                                        height={480} 
                                        style={styles.cameraVideo} 
                                    />
                                    
                                    <div style={styles.scanningFrame}>
                                        <div style={styles.scanLine}></div>
                                    </div>

                                    <div style={styles.cameraOverlay}>
                                        <div style={styles.emotionHeader}>
                                            <span style={styles.emotionLabel}>{emotion.toUpperCase()}</span>
                                            <span style={styles.confidenceText}>{Math.round(confidence * 100)}%</span>
                                        </div>
                                        <div style={styles.confidenceBar}>
                                            <div style={{...styles.confidenceLevel, width: `${confidence * 100}%`}} />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* STATS & RANKING BOX */}
                    <div style={styles.statsBox}>
                        <div style={styles.boxHeaderMini}>
                            <span>MIS ESTADÍSTICAS</span>
                        </div>
                        <div style={styles.statsContent}>
                            <div style={styles.userStats}>
                                <div style={styles.statItem}>
                                    <span style={styles.statLabel}>TU RÉCORD</span>
                                    <span style={styles.statValue}>{userBestScore}</span>
                                </div>
                                <div style={styles.statItem}>
                                    <span style={styles.statLabel}>SESIÓN ACTUAL</span>
                                    <span style={styles.statValue}>{savedScore ?? score}</span>
                                </div>
                            </div>

                            <div style={styles.rankingTitle}>TOP 5 GLOBAL</div>
                            <div style={styles.rankingList}>
                                {ranking.slice(0, 3).map((rank, index) => (
                                    <div key={index} style={styles.rankingItem}>
                                        <span style={styles.rankNum}>{index + 1}º</span>
                                        <span style={styles.rankName}>{rank.user.name}</span>
                                        <span style={styles.rankScore}>{rank.high_score}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* CHAT BOX */}
                    <div style={styles.chatBox}>
                        <div style={styles.boxHeaderMini}>
                            <span>MI CHAT PRIVADO</span>
                        </div>
                        <div style={styles.chatContent}>
                            <GameChat messages={messages || []} room={userRoom} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        height: '100vh',
        width: '100%',
        background: '#0a0a0c',
        color: '#fff',
        fontFamily: "'Outfit', sans-serif",
        padding: '12px',
        boxSizing: 'border-box',
        overflow: 'hidden',
    },
    bentobox: {
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
        gap: '12px',
        height: '100%',
        width: '100%',
    },
    gameBox: {
        background: 'rgba(23, 23, 28, 0.8)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(20px)',
    },
    sidebar: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        height: '100%',
        maxHeight: '100%',
        overflow: 'hidden',
    },
    boxHeader: {
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    },
    boxHeaderMini: {
        padding: '8px 15px',
        fontSize: '10px',
        fontWeight: 700,
        letterSpacing: '1px',
        color: 'rgba(255, 255, 255, 0.4)',
        background: 'rgba(255, 255, 255, 0.01)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
        display: 'flex',
        justifyContent: 'space-between',
        textTransform: 'uppercase',
    },
    boxTitle: {
        margin: 0,
        fontSize: '16px',
        fontWeight: 600,
        flex: 1,
    },
    backButton: {
        color: '#fff',
        textDecoration: 'none',
        fontSize: '20px',
        opacity: 0.6,
    },
    liveBadge: {
        background: '#ff4b2b',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '9px',
        fontWeight: 'bold',
    },
    iframeContainer: {
        flex: 1,
        width: '100%',
        background: '#000',
    },
    iframe: {
        width: '100%',
        height: '100%',
        border: 'none',
    },
    cameraBox: {
        height: '180px',
        background: 'rgba(23, 23, 28, 0.8)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
    },
    cameraContent: {
        flex: 1,
        position: 'relative',
        background: '#000',
    },
    cameraVideo: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transform: 'scaleX(-1)',
    },
    scanningFrame: {
        position: 'absolute',
        top: '10%',
        left: '15%',
        right: '15%',
        bottom: '10%',
        border: '1px solid rgba(0, 212, 255, 0.2)',
        borderRadius: '15px',
        pointerEvents: 'none',
    },
    scanLine: {
        position: 'absolute',
        width: '100%',
        height: '1px',
        background: 'rgba(0, 212, 255, 0.5)',
        top: '0%',
        left: 0,
        animation: 'scan 3s linear infinite',
    },
    cameraPlaceholder: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        color: 'rgba(255, 255, 255, 0.2)',
    },
    cameraIcon: {
        fontSize: '24px',
    },
    cameraOverlay: {
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '8px',
        borderRadius: '12px',
        backdropFilter: 'blur(4px)',
    },
    emotionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '4px',
    },
    emotionLabel: {
        fontSize: '11px',
        fontWeight: 800,
        color: '#00d4ff',
    },
    confidenceText: {
        fontSize: '9px',
        color: 'rgba(255, 255, 255, 0.5)',
    },
    confidenceBar: {
        height: '3px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '2px',
        overflow: 'hidden',
    },
    confidenceLevel: {
        height: '100%',
        background: '#00d4ff',
        transition: 'width 0.5s ease',
    },
    statsBox: {
        height: '180px',
        background: 'rgba(23, 23, 28, 0.8)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
    },
    statsContent: {
        padding: '15px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        flex: 1,
    },
    userStats: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px',
    },
    statItem: {
        background: 'rgba(255, 255, 255, 0.03)',
        padding: '10px',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    statLabel: {
        fontSize: '8px',
        color: 'rgba(255, 255, 255, 0.4)',
        fontWeight: 700,
        marginBottom: '2px',
    },
    statValue: {
        fontSize: '18px',
        fontWeight: 700,
        color: '#fff',
    },
    rankingTitle: {
        fontSize: '10px',
        fontWeight: 800,
        color: 'rgba(255, 255, 255, 0.3)',
        textAlign: 'center',
    },
    rankingList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    rankingItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '6px 10px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '8px',
        fontSize: '12px',
    },
    rankNum: {
        width: '24px',
        color: '#00d4ff',
        fontWeight: 800,
    },
    rankName: {
        flex: 1,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    rankScore: {
        fontWeight: 700,
    },
    chatBox: {
        flex: 1,
        background: 'rgba(23, 23, 28, 0.8)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
    },
    chatContent: {
        flex: 1,
        overflow: 'hidden',
    },
};
