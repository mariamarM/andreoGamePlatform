import { Head, Link } from '@inertiajs/react';
import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';

interface Props {
    user: {
        name: string;
        email: string;
        role_id: number;
    };
}

export default function GestorDashboard() {
    return (
        <DashboardLayout title="Panel de Gestor">
            <Head title="Gestor Dashboard" />

            <div style={styles.contentWrap}>
                <div style={styles.welcomeSection}>
                    <h2 style={styles.title}>Panel de Gestor</h2>
                    <p style={styles.subtitle}>Gestión de contenidos y comunicación con jugadores.</p>
                </div>

                <div style={styles.bentobox}>
                    <Link href="/gestor/games" style={styles.bentoCard}>
                        <div style={styles.cardHeader}>
                            <h3 style={styles.cardTitle}>Mis Juegos</h3>
                            <div style={styles.cardCircle}></div>
                        </div>
                        <p style={styles.cardDesc}>Administrar catálogo de juegos propios.</p>
                    </Link>

                    <Link href="/staff-chat" style={styles.bentoCard}>
                        <div style={styles.cardHeader}>
                            <h3 style={styles.cardTitle}>Staff Chat</h3>
                            <div style={{...styles.cardCircle, background: '#3b82f6'}}></div>
                        </div>
                        <p style={styles.cardDesc}>Comunicación con otros gestores y administración.</p>
                    </Link>

                    <Link href="/chat" style={styles.bentoCard}>
                        <div style={styles.cardHeader}>
                            <h3 style={styles.cardTitle}>Mensajería</h3>
                            <div style={{...styles.cardCircle, background: '#10b981'}}></div>
                        </div>
                        <p style={styles.cardDesc}>Atención directa a jugadores del sistema.</p>
                    </Link>

                    <div style={{...styles.bentoCard, cursor: 'default'}}>
                        <div style={styles.cardHeader}>
                            <h3 style={styles.cardTitle}>Estado Sistema</h3>
                            <div style={{...styles.cardCircle, background: '#f59e0b'}}></div>
                        </div>
                        <p style={styles.cardDesc}>Plataforma activa y estable.</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

const styles: Record<string, React.CSSProperties> = {
    contentWrap: {
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
    },
    welcomeSection: {
        marginBottom: '10px',
    },
    title: {
        fontSize: '28px',
        fontWeight: 800,
        color: '#1e293b',
        margin: '0 0 5px 0',
    },
    subtitle: {
        fontSize: '15px',
        color: '#64748b',
        margin: 0,
    },
    bentobox: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '20px',
    },
    bentoCard: {
        background: 'rgba(255, 255, 255, 0.3)',
        padding: '30px',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'transform 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: '18px',
        fontWeight: 700,
        color: '#1e293b',
        margin: 0,
    },
    cardCircle: {
        width: '12px',
        height: '12px',
        background: '#fff',
        borderRadius: '50%',
        boxShadow: '0 0 10px rgba(255,255,255,0.5)',
    },
    cardDesc: {
        fontSize: '14px',
        color: '#64748b',
        lineHeight: '1.5',
        margin: 0,
    },
};
