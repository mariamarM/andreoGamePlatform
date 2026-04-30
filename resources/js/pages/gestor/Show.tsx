import { Link, router, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

interface Game {
  id: number;
  title: string;
  description: string;
  url: string;
  // Assuming we might have more fields like user_id, etc.
}

interface GestorShowProps {
  user?: {
    id: number;
    name: string;
    email: string;
    role_id: number;
  } | null;
}

export default function GestorShow({ user }: GestorShowProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch games from API
  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/games');
        if (!response.ok) {
          throw new Error(`Error fetching games: ${response.status}`);
        }
        const data: Game[] = await response.json();
        setGames(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error fetching games:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  // Handle deleting a game
  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este juego?')) {
      return;
    }

    try {
      const response = await fetch(`/api/games/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // Assuming we need to send CSRF token or similar, adjust as needed
        },
      });

      if (!response.ok) {
        throw new Error(`Error deleting game: ${response.status}`);
      }

      // Remove the game from the list
      setGames(prevGames => prevGames.filter(game => game.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error deleting game:', err);
    }
  };

  // Handle editing a game (navigate to edit page)
  const handleEdit = (id: number) => {
    router.visit(`/gestor/games/${id}/edit`);
  };

  if (loading) {
    return <div>Cargando juegos...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.logoText}>Juegos Generales</h1>
        <div style={styles.headerButtons}>
          <Link href="/gestor" style={styles.backButton}>
            ← Volver al Panel
          </Link>
        </div>
      </header>

      {/* Games List */}
      <main style={styles.main}>
        {games.length === 0 ? (
          <p style={styles.emptyMessage}>No hay juegos disponibles.</p>
        ) : (
          <div style={styles.gamesGrid}>
            {games.map(game => (
              <div key={game.id} style={styles.gameCard}>
                <div style={styles.gameInfo}>
                  <h3 style={styles.gameTitle}>{game.title}</h3>
                  <p style={styles.gameDescription}>{game.description}</p>
                  <a 
                    href={game.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={styles.gameUrl}
                  >
                    Jugar ahora
                  </a>
                </div>
                <div style={styles.gameActions}>
                  <button 
                    onClick={() => handleEdit(game.id)} 
                    style={styles.editButton}
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(game.id)} 
                    style={styles.deleteButton}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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
  emptyMessage: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: '1.25rem',
  },
  gamesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  gameCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  gameInfo: {
    padding: '1.5rem',
    flex: 1,
  },
  gameTitle: {
    color: '#1e293b',
    fontSize: '1.25rem',
    fontWeight: '600',
    margin: '0 0 0.5rem 0',
  },
  gameDescription: {
    color: '#475569',
    fontSize: '0.95rem',
    margin: '0 0 1.5rem 0',
    lineHeight: '1.5',
  },
  gameUrl: {
    display: 'inline-block',
    padding: '0.5rem 1rem',
    backgroundColor: '#3b82f6',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
  gameActions: {
    display: 'flex',
    gap: '0.75rem',
    padding: '1rem 1.5rem',
    borderTop: '1px solid #e2e8f0',
  },
  editButton: {
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
  deleteButton: {
    flex: 1,
    padding: '0.75rem',
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
};