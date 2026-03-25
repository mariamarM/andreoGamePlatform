import { Link } from '@inertiajs/react';
import React from 'react';

interface HomeProps {
  user?: {
    id: number;
    name: string;
    email: string;
    role_id: number;
  } | null;
}

export default function Home({ user }: HomeProps) {
  return (
    <div style={styles.container}>
      {/* Fondo con gradiente */}
      <div style={styles.backgroundGradient} />

      {/* Header con botones de Login y Register */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <h1 style={styles.logoText}>GamePlatform</h1>
        </div>
        <div style={styles.headerButtons}>
          <Link href="/login" style={styles.loginButton}>
            Login
          </Link>
          <Link href="/register" style={styles.registerButton}>
            Register
          </Link>
        </div>
      </header>

      {/* Contenido principal con glass effect */}
      <main style={styles.glassContainer}>
        <div style={styles.glassContent}>
          <h2 style={styles.title}>
            {user ? `Bienvenido, ${user.name}!` : 'Bienvenido a GamePlatform'}
          </h2>
          <p style={styles.subtitle}>
            {user
              ? 'Explora todas las funcionalidades según tu rol.'
              : 'La mejor plataforma para gestionar y jugar juegos.'}
          </p>

          {/* Widgets según rol */}
          {user && (
            <div style={styles.widgetsGrid}>
              {user.role_id === 1 && (
                <>
                  <div style={styles.card}>Panel de Admin</div>
                  <div style={styles.card}>Gestionar Usuarios</div>
                  <div style={styles.card}>Reportes</div>
                </>
              )}
              {user.role_id === 2 && (
                <>
                  <div style={styles.card}>Gestionar Juegos</div>
                  <div style={styles.card}>Estadísticas</div>
                  <div style={styles.card}>Reportes</div>
                </>
              )}
              {user.role_id === 3 && (
                <>
                  <div style={styles.card}>Mis Juegos</div>
                  <div style={styles.card}>Logros</div>
                  <div style={styles.card}>Ranking</div>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>© {new Date().getFullYear()} GamePlatform. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundGradient: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    zIndex: -1,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem 3rem',
  },
  logo: {
    flex: 1,
  },
  logoText: {
    color: '#fff',
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '50px',
    color: '#fff',
    textDecoration: 'none',
    fontWeight: 500,
    transition: 'all 0.3s ease',
  },
  registerButton: {
    padding: '0.6rem 1.5rem',
    backgroundColor: '#fff',
    border: 'none',
    borderRadius: '50px',
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: 600,
    transition: 'all 0.3s ease',
  },
  glassContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem',
    minHeight: 'calc(100vh - 200px)',
  },
  glassContent: {
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '30px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    padding: '3rem 4rem',
    textAlign: 'center',
    maxWidth: '800px',
    width: '100%',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  },
  title: {
    color: '#fff',
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '1.2rem',
    marginBottom: '2rem',
  },
  widgetsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem',
    marginTop: '2rem',
  },
  card: {
    padding: '1.2rem',
    background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    color: '#fff',
    fontWeight: 600,
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  footer: {
    padding: '1.5rem',
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.7)',
  },
};
