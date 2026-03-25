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
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Bienvenido a mi App
        </h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
          Esta es la página principal. Gestiona tus usuarios, proyectos o juega según tu rol.
        </p>

        {/* Botones de login / registro */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          {canLogin && (
            <a
              href="/login"
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#38bdf8',
                color: 'white',
                borderRadius: '0.25rem',
                textDecoration: 'none',
              }}
            >
              Iniciar Sesión
            </a>
          )}
          {canRegister && (
            <a
              href="/register"
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#10b981',
                color: 'white',
                borderRadius: '0.25rem',
                textDecoration: 'none',
              }}
            >
              Registrarse
            </a>
          )}
        </div>
      </main>

      {/* Footer simple */}
      <footer style={{ padding: '1rem', textAlign: 'center', backgroundColor: '#f3f4f6', marginTop: '2rem' }}>
        <p>© {new Date().getFullYear()} MiApp. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
