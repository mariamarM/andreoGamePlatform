import { router, Link } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

interface Game {
    id: number;
    title: string;
    description: string;
    url: string;
    is_published: boolean;
}

interface HomeProps {
    user?: {
        id: number;
        name: string;
        email: string;
        role_id: number;
    };
    games: Game[];
}

export default function Home({ user, games }: HomeProps) {
    const [mouse, setMouse] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMove = (e: globalThis.MouseEvent) => {
            setMouse({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMove);

        return () => window.removeEventListener('mousemove', handleMove);
    }, []);

    return (
        <div style={styles.container}>
            <div style={styles.pixelOverlay} />

            <div
                style={{
                    ...styles.lens,
                    left: mouse.x,
                    top: mouse.y,
                    backgroundPosition: `${-mouse.x + 75}px ${-mouse.y + 75}px`,
                }}
            />

            <main style={styles.glassContainer}>
                <div style={styles.glassContent}>
                    <div style={styles.innerBlur} />

                    <div style={styles.header}>
                        <div style={styles.leftLinks}>
                            {!user ? (
                                <>
                                    <Link href="/login">Login</Link>
                                    <Link href="/register">Register</Link>
                                </>
                            ) : (
                                <button
                                    style={styles.logoutButton}
                                    onClick={() => router.post('/logout')}
                                >
                                    Cerrar Sesión
                                </button>
                            )}
                            <Link href="/chat">Chat</Link>
                        </div>
                        <h1 style={styles.titleCenter}>Game Center Web</h1>
                    </div>
                    <div style={styles.content}>
                        <h2>
                            {user
                                ? `Bienvenido, ${user.name}!`
                                : 'Bienvenido a GamePlatform'}
                        </h2>

                        <p>
                            {user
                                ? 'Explora todas las funcionalidades según tu rol.'
                                : 'La mejor plataforma para gestionar y jugar juegos.'}
                        </p>
                        {/* Juegos del juego - clicables */}
                        <div style={styles.widgetsGrid}>
                            {games.map((game) => (
                                <Link key={game.id} href={`/game/${game.id}`} style={styles.card}>
                                    <div style={styles.cardTitle}>{game.title}</div>
                                    <div style={styles.iframeWrapper}>
                                        <iframe
                                            style={styles.iframe}
                                            src={game.url}
                                            title={game.title}
                                        />
                                    </div>
                                    <div style={styles.cardArrow}>↗</div>
                                </Link>
                            ))}
                        </div>
                        {user && (
                            <div style={styles.widgetsGrid}>
                                {user.role_id === 1 && (
                                    <>
                                        <div style={styles.card}>
                                            Panel de Admin
                                        </div>
                                        <div style={styles.card}>
                                            Gestionar Usuarios
                                        </div>
                                        <div style={styles.card}>Reportes</div>
                                    </>
                                )}

                                {user.role_id === 2 && (
                                    <>
                                        <div style={styles.card}>
                                            Gestionar Juegos
                                        </div>
                                        <div style={styles.card}>
                                            Estadísticas
                                        </div>
                                        <div style={styles.card}>Reportes</div>
                                    </>
                                )}

                                {user.role_id === 3 && (
                                    <>
                                        <div style={styles.card}>
                                            Mis Juegos
                                        </div>
                                        <div style={styles.card}>Logros</div>
                                        <div style={styles.card}>Ranking</div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        height: '100vh',
        width: '100%',
        fontFamily: "'Rubik', sans-serif",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },
    videoBg: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        zIndex: -1,
        filter: 'blur(6px) brightness(0.3)',
        transform: 'scale(1.2)',
        imageRendering: 'pixelated',
    },
    pixelOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',

        pointerEvents: 'none',

        backgroundImage: `
    linear-gradient(rgba(0,0,0,0.15) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,0,0,0.15) 1px, transparent 1px)
  `,
        backgroundSize: '25px 25px',

        zIndex: -1,
    },
    lens: {
        position: 'fixed',
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        pointerEvents: 'none',
        backgroundImage: 'url(/bg/clouds.jpg)',
        backgroundSize: '130wh 100vh',
        backgroundRepeat: 'no-repeat',

        transform: 'translate(-50%, -50%)',
        zIndex: 2,
    },
    content: {
        textAlign: 'center',
    },
    leftLinks: {
        display: 'flex',
        gap: '1rem',
        position: 'relative',
        zIndex: 50,
    },

    titleCenter: {
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '35px',
        fontWeight: 600,
        margin: 0,
        color: '#1e293b',
    },
    iframe: {
        width: '100%',
        height: '100%',
        border: 'none',
        borderRadius: '10px',
    },
    iframeWrapper: {
        width: '100%',
        height: '180px',
        overflow: 'hidden',
        borderRadius: '10px',
        background: '#000',
    },
    innerBlur: {
        position: 'absolute',
        inset: 0,
        borderRadius: '30px',
        pointerEvents: 'none',
        background: `
    radial-gradient(circle at top, rgba(255,255,255,0.4), transparent 60%),
    radial-gradient(circle at bottom, rgba(255,255,255,0.3), transparent 60%)
  `,
    },
    header: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        marginBottom: '2rem',
    },
    logo: {
        flex: 1,
    },
    logoutButton: {
        padding: '0.5rem 1rem',
        border: 'none',
        borderRadius: '8px',
        color: '#ef4444',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'all 0.3s ease',
    },
    logoText: {
        color: '#1e293b',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        margin: 0,
    },
    headerButtons: {
        display: 'flex',
        gap: '1rem',
    },
    loginButton: {
        padding: '0.6rem 1.5rem',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '2px solid #1e293b',
        borderRadius: '50px',
        color: '#1e293b',
        textDecoration: 'none',
        fontWeight: 500,
        transition: 'all 0.3s ease',
    },
    registerButton: {
        padding: '0.6rem 1.5rem',
        backgroundColor: '#1e293b',
        border: 'none',
        borderRadius: '50px',
        color: '#fff',
        textDecoration: 'none',
        fontWeight: 600,
        transition: 'all 0.3s ease',
    },
    glassContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px 40px',
        minHeight: 'calc(118vh - 160px)',
    },

    glassContent: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(25px)',
        WebkitBackdropFilter: 'blur(25px)',
        borderRadius: '30px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        padding: '3rem 4rem',
        textAlign: 'center',
        maxWidth: '89%',
        width: '100%',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden',
        height: '95%',
    },

    title: {
        color: '#1e293b',
        fontSize: '2.5rem',
        fontWeight: 'bold',
        marginBottom: '1rem',
    },
    subtitle: {
        color: 'rgba(30, 41, 59, 0.8)',
        fontSize: '1.2rem',
        marginBottom: '2rem',
    },
    widgetsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem',
        marginTop: '2rem',
    },
    card: {
        position: 'relative',
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.6)',
        borderRadius: '16px',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        color: '#fff',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },

    cardTitle: {
        fontSize: '14px',
        fontWeight: 500,
    },

    cardArrow: {
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        fontSize: '16px',
        transform: 'rotate(0deg)',
    },
};
