import React from 'react';

import Navbar from '@/components/MisComponentes/Navbar';

interface WelcomeProps {
  user?: {
    id: number;
    name: string;
    email: string;
    role_id: number;
  } | null;
  canLogin: boolean;
  canRegister: boolean;
}

export default function Welcome({ user, canLogin, canRegister }: WelcomeProps) {
  return (
    <div>
      {/* Navbar */}
      <Navbar user={user} />

      {/* Hero / bienvenida */}
      <main style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 180px)',
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '30px',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          padding: '3rem 4rem',
          maxWidth: '800px',
          width: '100%',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
        }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1e293b' }}>
            Bienvenido a mi App
          </h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: 'rgba(30, 41, 59, 0.8)' }}>
            Esta es la página principal. Gestiona tus usuarios, proyectos o juega según tu rol.
          </p>

          {/* Botones de login / registro */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            {canLogin && (
              <a
                href="/login"
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#1e293b',
                  color: 'white',
                  borderRadius: '50px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                }}
              >
                Iniciar Sesión
              </a>
            )}
            {canRegister && (
              <a
                href="/register"
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  color: '#1e293b',
                  border: '2px solid #1e293b',
                  borderRadius: '50px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                }}
              >
                Registrarse
              </a>
            )}
          </div>
        </div>
      </main>

      {/* Footer simple */}
      <footer style={{
        padding: '1rem',
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        color: 'rgba(30, 41, 59, 0.6)',
      }}>
        <p>© {new Date().getFullYear()} MiApp. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
