import { Head, Link, router } from '@inertiajs/react';
import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { showToast } from '@/utils/toast';

interface Game {
    id: number;
    title: string;
    description: string;
    url: string;
    image_url: string;
    user: {
        name: string;
    };
}

interface Props {
    games: Game[];
    isAdmin: boolean;
    user: any;
}

export default function GestorIndex({ games = [], isAdmin = false }: Props) {
    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de eliminar este juego?')) {
            router.delete(`/gestor/games/${id}`, {
                onSuccess: () => showToast('Juego eliminado', 'error')
            });
        }
    };

    return (
        <DashboardLayout title="Gestión de Juegos">
            <Head title="Mis Juegos" />
            
            <div style={styles.header}>
                <div style={styles.titleWrap}>
                    <Link href={isAdmin ? '/admin' : '/gestor'} style={styles.backLink}>←</Link>
                    <h1 style={styles.title}>Catálogo de Juegos</h1>
                </div>
                <Link href="/gestor/games/create" style={styles.createBtn}>
                    Nuevo Juego
                </Link>
            </div>

            <div style={styles.grid}>
                {games.map((game) => (
                    <div key={game.id} style={styles.card}>
                        <div style={styles.imageWrap}>
                            <img src={game.image_url} alt={game.title} style={styles.image} />
                            <div style={styles.imageOverlay}></div>
                        </div>
                        <div style={styles.cardBody}>
                            <h3 style={styles.gameTitle}>{game.title}</h3>
                            <p style={styles.gameDesc}>{game.description}</p>
                            <div style={styles.cardActions}>
                                <Link href={`/gestor/games/${game.id}/edit`} style={styles.editBtn}>Editar</Link>
                                <button onClick={() => handleDelete(game.id)} style={styles.deleteBtn}>Borrar</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {games.length === 0 && (
                <div style={styles.emptyState}>
                    <p>No hay juegos registrados en este momento.</p>
                </div>
            )}
        </DashboardLayout>
    );
}

const styles: Record<string, React.CSSProperties> = {
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '40px',
    },
    titleWrap: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
    },
    backLink: {
        textDecoration: 'none',
        color: '#1e293b',
        fontSize: '28px',
        fontWeight: 'bold',
    },
    title: {
        fontSize: '28px',
        fontWeight: 800,
        color: '#1e293b',
        margin: 0,
    },
    createBtn: {
        background: '#fff',
        color: '#1e293b',
        padding: '12px 25px',
        borderRadius: '14px',
        textDecoration: 'none',
        fontWeight: 700,
        fontSize: '14px',
        border: '1px solid rgba(0,0,0,0.1)',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '30px',
    },
    card: {
        background: 'rgba(255, 255, 255, 0.3)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        overflow: 'hidden',
        transition: 'transform 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
    },
    imageWrap: {
        height: '180px',
        position: 'relative',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    imageOverlay: {
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.2))',
    },
    cardBody: {
        padding: '25px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        flex: 1,
    },
    gameTitle: {
        fontSize: '18px',
        fontWeight: 800,
        color: '#1e293b',
        margin: 0,
    },
    gameDesc: {
        fontSize: '13px',
        color: '#64748b',
        lineHeight: '1.6',
        margin: 0,
        flex: 1,
    },
    cardActions: {
        display: 'flex',
        gap: '20px',
        marginTop: '15px',
        paddingTop: '15px',
        borderTop: '1px solid rgba(0,0,0,0.05)',
    },
    editBtn: {
        color: '#3b82f6',
        textDecoration: 'none',
        fontSize: '13px',
        fontWeight: 700,
    },
    deleteBtn: {
        color: '#ef4444',
        background: 'none',
        border: 'none',
        fontSize: '13px',
        fontWeight: 700,
        cursor: 'pointer',
    },
    emptyState: {
        textAlign: 'center',
        padding: '100px 0',
        color: '#64748b',
        fontSize: '16px',
    },
};
