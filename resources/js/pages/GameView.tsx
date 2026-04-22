import { useState } from 'react';
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
    },

    header: {
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        padding: '15px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '2px solid #00d4ff',
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
