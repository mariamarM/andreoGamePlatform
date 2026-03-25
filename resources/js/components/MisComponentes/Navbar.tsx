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
    <nav style={{ padding: '1rem', background: '#eee', display: 'flex', alignItems: 'center' }}>
      <Link href="/" style={{ marginRight: '1rem' }}>Home</Link>

      {user.role_id === 1 && (
        <>
          <Link href="/admin" style={{ marginRight: '1rem' }}>Admin Dashboard</Link>
          <Link href="/admin/settings" style={{ marginRight: '1rem' }}>Admin Settings</Link>
        </>
      )}

      {user.role_id === 2 && (
        <>
          <Link href="/gestor" style={{ marginRight: '1rem' }}>Gestor Dashboard</Link>
          <Link href="/gestor/games" style={{ marginRight: '1rem' }}>Gestor Games</Link>
        </>
      )}

      {user.role_id === 3 && (
        <Link href="/player" style={{ marginRight: '1rem' }}>Player Dashboard</Link>
      )}

      <button
        onClick={() => router.post('/logout')}
        style={{ marginLeft: 'auto', padding: '0.3rem 0.6rem', cursor: 'pointer' }}
      >
        Logout
      </button>
    </nav>
  );
}
