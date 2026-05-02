import { Link, router, usePage } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import logoOpacity from '../assets/multimedia/logo_opacity.png';

interface Props {
    children: React.ReactNode;
    user: {
        name: string;
        role_id: number;
    };
    title: string;
}

export default function DashboardLayout({ children, title }: { children: React.ReactNode, title: string }) {
    const { auth } = usePage().props as any;
    const user = auth?.user;
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const handleLogout = () => {
        router.post('/logout');
    };

    // Escuchar eventos de Inertia para mostrar Toasts automáticos si hay flash messages
    // (Opcional: podrías usar props.flash de Inertia si están configurados)

    useEffect(() => {
        const handleToast = (e: any) => {
            setToast({ message: e.detail.message, type: e.detail.type || 'success' });
        };
        window.addEventListener('show-toast', handleToast);
        return () => window.removeEventListener('show-toast', handleToast);
    }, []);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    return (
        <div style={styles.container}>
            {/* Fullscreen Video Background */}
            <video autoPlay loop muted playsInline style={styles.bgVideo}>
                <source src="/bg/clouds.mp4" type="video/mp4" />
            </video>

            {/* Subtle Overlay Logo */}
            <img src={logoOpacity} style={styles.subtleLogo} alt="Logo" />

            {/* Header */}
            <header style={styles.header}>
                <div style={styles.headerLeft}>
                    <Link href="/" style={styles.logoLink}>
                        {/* Main Logo Mockup */}
                        <div style={styles.mainLogo}>
                            <div style={styles.logoOpacity}></div>
                            <span style={styles.logoText}>GameAnd</span>
                        </div>
                    </Link>
                </div>
                <div style={styles.headerRight}>
                    <span style={styles.userName}>{user?.name || 'Cargando...'}</span>
                    <button onClick={handleLogout} style={styles.logoutBtn}>Cerrar Sesión</button>
                </div>
            </header>

            {/* Content Area */}
            <main style={styles.main}>
                <div style={styles.glassContent}>
                    {children}
                </div>
            </main>

            {/* Toast Notification */}
            {toast && (
                <div style={{
                    ...styles.toast,
                    borderLeft: `4px solid ${toast.type === 'success' ? '#10b981' : '#ef4444'}`
                }}>
                    {toast.message}
                </div>
            )}

            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(100px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
    },
    bgVideo: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        zIndex: -2,
    },
    subtleLogo: {
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        width: '100px',
        opacity: 0.15,
        zIndex: 10,
        pointerEvents: 'none',
    },
    header: {
        height: '80px',
        padding: '0 100px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(5px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
        zIndex: 20,
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
    },
    logoLink: {
        textDecoration: 'none',
    },
    mainLogo: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    logoCircle: {
        width: '32px',
        height: '32px',
        background: '#fff',
        borderRadius: '50%',
        boxShadow: '0 0 20px rgba(255,255,255,0.5)',
    },
    logoText: {
        fontSize: '18px',
        fontWeight: 900,
        color: '#fff',
        letterSpacing: '2px',
    },
    headerRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
    },
    userName: {
        fontSize: '14px',
        fontWeight: 600,
        color: '#fff',
    },
    logoutBtn: {
        padding: '8px 20px',
        background: 'rgba(255, 255, 255, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        borderRadius: '12px',
        color: '#fff',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
        backdropFilter: 'blur(10px)',
    },
    main: {
        flex: 1,
        padding: '40px 100px', // Margen lateral de 100px
        zIndex: 1,
    },
    glassContent: {
        background: 'rgba(255, 255, 255, 0.45)', // Más blanco blurry
        backdropFilter: 'blur(25px)',
        borderRadius: '20px', // Pedido por el usuario
        border: '1px solid rgba(255, 255, 255, 0.5)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        padding: '40px',
        minHeight: '60vh',
    },
    toast: {
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        background: '#fff',
        color: '#1e293b',
        padding: '16px 24px',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        fontSize: '14px',
        fontWeight: 600,
        zIndex: 100,
        animation: 'slideUp 0.3s ease-out',
    },
};
