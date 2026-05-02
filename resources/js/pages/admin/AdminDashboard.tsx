import { Head, Link } from '@inertiajs/react';
import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';

interface User {
    id: number;
    name: string;
    email: string;
    created_at: string;
}

interface Game {
    id: number;
    title: string;
    updated_at: string;
}

interface Props {
    user: {
        name: string;
        email: string;
        role_id: number;
    };
    recentUsers: User[];
    recentGames: Game[];
}

export default function AdminDashboard({ recentUsers = [], recentGames = [] }: Props) {
    return (
        <DashboardLayout title="Panel de Administración">
            <Head title="Admin Dashboard" />

            <div style={styles.contentWrap}>
                <div style={styles.welcomeSection}>
                    <h2 style={styles.title}>Panel de Control</h2>
                    <p style={styles.subtitle}>Gestión centralizada del sistema.</p>
                </div>

                <div style={styles.bentobox}>
                    {/* Left side: Navigation */}
                    <div style={styles.navBento}>
                        <Link href="/admin/users" style={styles.navCard}>
                            <div style={styles.cardIcon}>
                                <div style={{...styles.iconShape, borderRadius: '4px'}}></div>
                            </div>
                            <div style={styles.cardInfo}>
                                <h3 style={styles.cardTitle}>Usuarios</h3>
                                <p style={styles.cardDesc}>Gestionar Players y Gestores</p>
                            </div>
                        </Link>
                        <Link href="/admin/games" style={styles.navCard}>
                            <div style={styles.cardIcon}>
                                <div style={{...styles.iconShape, borderRadius: '50%'}}></div>
                            </div>
                            <div style={styles.cardInfo}>
                                <h3 style={styles.cardTitle}>Juegos</h3>
                                <p style={styles.cardDesc}>Catálogo completo de títulos</p>
                            </div>
                        </Link>
                        <Link href="/staff-chat" style={styles.navCard}>
                            <div style={styles.cardIcon}>
                                <div style={{...styles.iconShape, transform: 'rotate(45deg)'}}></div>
                            </div>
                            <div style={styles.cardInfo}>
                                <h3 style={styles.cardTitle}>Staff Chat</h3>
                                <p style={styles.cardDesc}>Canal de comunicación interna</p>
                            </div>
                        </Link>
                    </div>

                    {/* Right side: Recent Activity (Wider) */}
                    <div style={styles.activityBento}>
                        <h3 style={styles.sectionTitle}>Actividad Reciente</h3>
                        <div style={styles.activityList}>
                            {recentUsers.map(u => (
                                <div key={`u-${u.id}`} style={styles.activityItem}>
                                    <div style={styles.activityDot}></div>
                                    <div style={styles.activityContent}>
                                        <span style={styles.activityName}>{u.name}</span>
                                        <span style={styles.activityAction}>se ha unido a la plataforma</span>
                                        <span style={styles.activityTime}>{new Date(u.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                            {recentGames.map(g => (
                                <div key={`g-${g.id}`} style={styles.activityItem}>
                                    <div style={{...styles.activityDot, background: '#3b82f6'}}></div>
                                    <div style={styles.activityContent}>
                                        <span style={styles.activityName}>{g.title}</span>
                                        <span style={styles.activityAction}>ha sido actualizado</span>
                                        <span style={styles.activityTime}>{new Date(g.updated_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
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
        gridTemplateColumns: '1fr 1.5fr', // Activity más ancho
        gap: '25px',
    },
    navBento: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    navCard: {
        background: 'rgba(255, 255, 255, 0.25)',
        padding: '24px',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        textDecoration: 'none',
        color: 'inherit',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)',
        backdropFilter: 'blur(10px)',
    },
    cardIcon: {
        width: '56px',
        height: '56px',
        background: 'rgba(255, 255, 255, 0.4)',
        borderRadius: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'inset 0 0 10px rgba(255,255,255,0.5)',
    },
    iconShape: {
        width: '16px',
        height: '16px',
        background: '#1e293b',
        opacity: 0.6,
    },
    cardInfo: {
        display: 'flex',
        flexDirection: 'column',
    },
    cardTitle: {
        fontSize: '16px',
        fontWeight: 700,
        color: '#1e293b',
        margin: 0,
    },
    cardDesc: {
        fontSize: '12px',
        color: '#64748b',
        margin: 0,
    },
    activityBento: {
        background: 'rgba(255, 255, 255, 0.2)',
        padding: '25px',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    sectionTitle: {
        fontSize: '18px',
        fontWeight: 700,
        color: '#1e293b',
        margin: 0,
    },
    activityList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    activityItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        padding: '12px 15px',
        background: 'rgba(255, 255, 255, 0.3)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    activityDot: {
        width: '8px',
        height: '8px',
        background: '#10b981',
        borderRadius: '50%',
        flexShrink: 0,
    },
    activityContent: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '13px',
    },
    activityName: {
        fontWeight: 700,
        color: '#1e293b',
    },
    activityAction: {
        color: '#64748b',
    },
    activityTime: {
        marginLeft: 'auto',
        fontSize: '11px',
        color: '#94a3b8',
    },
};
