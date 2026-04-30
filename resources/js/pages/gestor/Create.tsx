import { router, usePage } from '@inertiajs/react';
import React, { useState } from 'react';

interface Game {
  id: number;
  title: string;
  description: string;
  url: string;
}

interface GestorCreateProps {
  user?: {
    id: number;
    name: string;
    email: string;
    role_id: number;
  } | null;
}

export default function GestorCreate({ user }: GestorCreateProps) {
  const [game, setGame] = useState<Partial<Game>>({
    title: '',
    description: '',
    url: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Assuming we need to send CSRF token or similar, adjust as needed
        },
        body: JSON.stringify({
          ...game,
          user_id: user?.id || 1, // Default to user ID 1 if not available
        }),
      });

      if (!response.ok) {
        throw new Error(`Error creating game: ${response.status}`);
      }

      // Redirect back to the games list
      router.visit('/gestor/games');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error creating game:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.logoText}>Crear Nuevo Juego</h1>
        <div style={styles.headerButtons}>
          <Link href="/gestor/games" style={styles.backButton}>
            ← Volver a Juegos
          </Link>
        </div>
      </header>

      {/* Create Form */}
      <main style={styles.main}>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Título:</label>
            <input
              type="text"
              value={game.title || ''}
              onChange={(e) => setGame({ ...game, title: e.target.value })}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Descripción:</label>
            <textarea
              value={game.description || ''}
              onChange={(e) => setGame({ ...game, description: e.target.value })}
              style={styles.textarea}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>URL del Juego:</label>
            <input
              type="url"
              value={game.url || ''}
              onChange={(e) => setGame({ ...game, url: e.target.value })}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.formActions}>
            <button type="submit" disabled={loading} style={styles.submitButton}>
              {loading ? 'Creando...' : 'Crear Juego'}
            </button>
            <button
              type="button"
              onClick={() => router.visit(`/gestor/games`)}
              style={styles.cancelButton}
            >
              Cancelar
            </button>
          </div>
          {error && <div style={styles.errorMessage}>Error: {error}</div>}
        </form>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    width: '100%',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: '#f8fafc',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem 2rem',
    backgroundColor: '#fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
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
  backButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  main: {
    padding: '2rem',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    padding: '2rem',
  },
  formGroup: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '600',
    color: '#1e293b',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '1rem',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '1rem',
    minHeight: '100px',
    resize: 'vertical',
  },
  formActions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '2rem',
  },
  submitButton: {
    flex: 1,
    padding: '0.75rem',
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  cancelButton: {
    flex: 1,
    padding: '0.75rem',
    backgroundColor: '#64748b',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  errorMessage: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '1rem',
    borderRadius: '6px',
    marginTop: '1rem',
  },
};