import {  useState } from "react";

interface GameViewProps {
    game: {
        id: number;
        title: string;
        itch_url: string;
    };
    user: {
        id: number;
        name: string;
        email: string;
    };
}


const styles: Record<string, React.CSSProperties> = {
    container: {
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        height: "100vh",
        gap: "10px",
        padding: "10px",
    },

    left: {
        background: "#000",
        borderRadius: "10px",
        overflow: "hidden",
    },

    iframe: {
        width: "100%",
        height: "100%",
        border: "none",
    },

    right: {
        display: "grid",
        gridTemplateRows: "1fr 1fr",
        gap: "10px",
    },

    topRight: {
        background: "#111",
        color: "#fff",
        padding: "20px",
        borderRadius: "10px",
    },

    bottomRight: {
        background: "#1a1a1a",
        color: "#fff",
        padding: "20px",
        borderRadius: "10px",
        display: "flex",
        flexDirection: "column",
    },

    input: {
        width: "100%",
        padding: "8px",
        marginTop: "10px",
        borderRadius: "6px",
        border: "none",
    },

    button: {
        marginTop: "10px",
        padding: "10px",
        background: "#22c55e",
        border: "none",
        borderRadius: "6px",
        color: "#fff",
        cursor: "pointer",
        fontWeight: "bold",
    },

    chatPlaceholder: {
        marginTop: "10px",
        flex: 1,
        background: "#000",
        borderRadius: "6px",
        padding: "10px",
    },
};
export default function GameView({ game, user }: GameViewProps) {
    const [score, setScore] = useState<number>(0);
    const [savedScore, setSavedScore] = useState<number | null>(null);

    const guardarPuntuacion = async () => {
    try {
        const token = (document.querySelector(
            'meta[name="csrf-token"]'
        ) as HTMLMetaElement).content;

        const res = await fetch("/api/game-sessions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": token,
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
            {/* IZQUIERDA - JUEGO */}
            <div style={styles.left}>
                <iframe
                    src={game.itch_url}
                    style={styles.iframe}
                    allowFullScreen
                />
            </div>

            {/* DERECHA */}
            <div style={styles.right}>
                {/* DATOS */}
                <div style={styles.topRight}>
                    <h2>{game.title}</h2>

                    <p><strong>Jugador:</strong> {user.name}</p>

                    <p>
                        <strong>Puntuación guardada:</strong>{" "}
                        {savedScore ?? "Sin guardar"}
                    </p>

                    <input
                        type="number"
                        placeholder="Introduce puntuación"
                        value={score}
                        onChange={(e) => setScore(Number(e.target.value))}
                        style={styles.input}
                    />

                    <button onClick={guardarPuntuacion} style={styles.button}>
                        Guardar puntuación
                    </button>
                </div>

                {/* CHAT */}
                <div style={styles.bottomRight}>
                    <h3>Chat en vivo</h3>

                    {/* Aquí puedes reutilizar tu componente de chat */}
                    {/* <Chat /> */}

                    <div style={styles.chatPlaceholder}>
                        Chat aquí...
                    </div>
                </div>
            </div>
        </div>
    );
}

