import { Link, router } from '@inertiajs/react';
import React from 'react';

interface GestorIndexProps {
  user?: {
    id: number;
    name: string;
    email: string;
    role_id: number;
  } | null;
}

export default function GestorIndex({ user }: GestorIndexProps) {
  const handleLogout = () => {
    router.post('/logout');
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.logoText}> Gestor Dashboard</h1>
        <div style={styles.headerButtons}>
          <span style={styles.userName}>Bienvenido, {user?.name}</span>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Contenido principal */}
      <main style={styles.main}>
        {/* Welcome Banner */}
        <div style={styles.welcomeBanner}>
          <h2 style={styles.welcomeTitle}>Bienvenido, {user?.name}</h2>
          <p style={styles.welcomeText}>Gestiona tus juegos y contenido</p>
        </div>

        {/* Grid de opciones principales */}
        <div style={styles.optionsGrid}>
          <Link href="/gestor/games" style={styles.optionCard}>
            <h3 style={styles.optionTitle}>Juegos generales</h3>
            <p style={styles.optionDesc}>Gestiona los juegos subidos por usuarios o otros gestores</p>
          </Link>

          <Link href="/gestor/stats" style={styles.optionCard}>
            <h3 style={styles.optionTitle}>Estadísticas</h3>
            <p style={styles.optionDesc}>Visualiza métricas y datos</p>
          </Link>

          <Link href="/staff-chat" style={styles.optionCard}>
            <h3 style={styles.optionTitle}>Chat</h3>
            <p style={styles.optionDesc}>Coordinación del equipo</p>
          </Link>

          <Link href="/gestor/content" style={styles.optionCard}>
            <h3 style={styles.optionTitle}>Contenido</h3>
            <p style={styles.optionDesc}>Crea y edita contenido</p>
          </Link>
        </div>

        {/* Panel inferior */}
        <div style={styles.bottomPanel}>
          <div style={styles.quickStats}>
            <div style={styles.quickStat}>
              <span style={styles.quickStatNumber}>12</span>
              <span style={styles.quickStatLabel}>Juegos Activos</span>
            </div>
            <div style={styles.quickStat}>
              <span style={styles.quickStatNumber}>85</span>
              <span style={styles.quickStatLabel}>Jugadores</span>
            </div>
            <div style={styles.quickStat}>
              <span style={styles.quickStatNumber}>4.7★</span>
              <span style={styles.quickStatLabel}>Rating Promedio</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    width: '100%',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    boxShadow: '0 2px 20px rgba(0, 0, 0, 0.1)',
    height: '60px',
  },
  logoText: {
    color: '#1e293b',
    fontSize: '1.3rem',
    fontWeight: 'bold',
    margin: 0,
  },
  headerButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  userName: {
    color: '#1e293b',
    fontSize: '0.9rem',
  },
  logoutButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#1e293b',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
  },
  main: {
    minHeight: 'calc(100vh - 60px)',
    padding: '1.5rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  welcomeBanner: {
    background: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    padding: '2rem 3rem',
    textAlign: 'center',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
  },
  welcomeTitle: {
    color: '#1e293b',
    fontSize: '2.5rem',
    fontWeight: 'bold',
    margin: '0 0 0.5rem 0',
  },
  welcomeText: {
    color: 'rgba(30, 41, 59, 0.8)',
    fontSize: '1.1rem',
    margin: 0,
  },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.5rem',
    flex: 1,
  },
  optionCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    padding: '2rem',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
  },
  optionIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
  },
  optionTitle: {
    color: '#1e293b',
    fontSize: '1.4rem',
    fontWeight: 'bold',
    margin: '0 0 0.5rem 0',
  },
  optionDesc: {
    color: 'rgba(30, 41, 59, 0.8)',
    fontSize: '0.95rem',
    margin: 0,
    textAlign: 'center',
  },
  bottomPanel: {
    background: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    padding: '1.5rem',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
  },
  quickStats: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  quickStat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  quickStatNumber: {
    color: '#1e293b',
    fontSize: '2rem',
    fontWeight: 'bold',
  },
  quickStatLabel: {
    color: 'rgba(30, 41, 59, 0.7)',
    fontSize: '0.85rem',
  },
};
