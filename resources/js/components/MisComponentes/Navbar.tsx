import { Link, router } from '@inertiajs/react';
import React from 'react';

interface NavbarProps {
  user?: {
    id: number;
    name: string;
    email: string;
    role_id: number;
  } | null;
}

export default function Navbar({ user }: NavbarProps) {
  if (!user) {
    return null;
  }

  return (
    <nav style={{
      padding: '1rem 2rem',
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      boxShadow: '0 2px 20px rgba(0, 0, 0, 0.1)',
    }}>
      <Link href="/" style={{ marginRight: '1rem', color: '#1e293b', fontWeight: 500 }}>Home</Link>

      {user.role_id === 1 && (
        <>
          <Link href="/admin" style={{ marginRight: '1rem', color: '#1e293b', fontWeight: 500 }}>Admin Dashboard</Link>
          <Link href="/admin/settings" style={{ marginRight: '1rem', color: '#1e293b', fontWeight: 500 }}>Admin Settings</Link>
        </>
      )}

      {user.role_id === 2 && (
        <>
          <Link href="/gestor" style={{ marginRight: '1rem', color: '#1e293b', fontWeight: 500 }}>Gestor Dashboard</Link>
          <Link href="/gestor/games" style={{ marginRight: '1rem', color: '#1e293b', fontWeight: 500 }}>Gestor Games</Link>
        </>
      )}

      {user.role_id === 3 && (
        <Link href="/player" style={{ marginRight: '1rem', color: '#1e293b', fontWeight: 500 }}>Player Dashboard</Link>
      )}

      <button
        onClick={() => router.post('/logout')}
        style={{
          marginLeft: 'auto',
          padding: '0.5rem 1rem',
          cursor: 'pointer',
          background: '#1e293b',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontWeight: 500,
        }}
      >
        Logout
      </button>
    </nav>
  );
}
