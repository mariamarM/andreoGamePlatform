import { Link, router } from '@inertiajs/react';
import React from 'react';

interface AdminDashboardProps {
  user?: {
    id: number;
    name: string;
    email: string;
    role_id: number;
  } | null;
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const handleLogout = () => {
    router.post('/logout');
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.logoText}>Admin Dashboard</h1>
        <div style={styles.headerButtons}>
          <span style={styles.userName}>Bienvenido, {user?.name}</span>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <aside style={styles.sidebar}>
          <nav style={styles.nav}>
            <Link href="/admin/users" style={styles.navItem}>Gestión de Usuarios</Link>
            <Link href="/admin/games" style={styles.navItem}> Gestión de Juegos</Link>
            <Link href="/admin/reports" style={styles.navItem}>Reportes</Link>
            <Link href="/admin/settings" style={styles.navItem}> Configuración</Link>
          </nav>
        </aside>

        <section style={styles.content}>
          <div style={styles.welcomeCard}>
            <h2 style={styles.welcomeTitle}>Bienvenido, {user?.name}</h2>
            <p style={styles.welcomeText}>Panel de control del administrador del sistema</p>
          </div>

          {/* Stats Cards */}
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>👥</div>
              <div style={styles.statInfo}>
                <span style={styles.statNumber}>150</span>
                <span style={styles.statLabel}>Usuarios</span>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statInfo}>
                <span style={styles.statNumber}>42</span>
                <span style={styles.statLabel}>Juegos</span>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statInfo}>
                <span style={styles.statNumber}>1.2K</span>
                <span style={styles.statLabel}>Reportes</span>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statInfo}>
                <span style={styles.statNumber}>8</span>
                <span style={styles.statLabel}>Config.</span>
              </div>
            </div>
          </div>
        </section>
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
    display: 'flex',
    minHeight: 'calc(100vh - 60px)',
    padding: '1.5rem',
    gap: '1.5rem',
  },
  sidebar: {
    width: '280px',
    background: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    padding: '1.5rem',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  navItem: {
    padding: '1rem',
    background: 'rgba(30, 41, 59, 0.05)',
    borderRadius: '12px',
    color: '#1e293b',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: 500,
    transition: 'all 0.2s ease',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  welcomeCard: {
    background: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    padding: '2rem',
    textAlign: 'center',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
  },
  welcomeTitle: {
    color: '#1e293b',
    fontSize: '2rem',
    fontWeight: 'bold',
    margin: '0 0 0.5rem 0',
  },
  welcomeText: {
    color: 'rgba(30, 41, 59, 0.7)',
    fontSize: '1rem',
    margin: 0,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1.5rem',
    flex: 1,
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    background: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    padding: '1.5rem',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
  },
  statIcon: {
    fontSize: '2.5rem',
  },
  statInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  statNumber: {
    color: '#1e293b',
    fontSize: '1.8rem',
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'rgba(30, 41, 59, 0.6)',
    fontSize: '0.85rem',
  },
};
