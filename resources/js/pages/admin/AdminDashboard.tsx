import React from 'react';

import Navbar from '@/components/MisComponentes/Navbar';

interface AdminDashboardProps {
  user?: {
    id: number;
    name: string;
    email: string;
    role_id: number;
  } | null;
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  if (!user) {
    return <p>Cargando usuario...</p>;
  }

  return (
    <div>
      <Navbar user={user} />

      <main style={{ padding: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Panel de Administrador
        </h1>
        <p>Bienvenido, {user.name}. Aquí puedes administrar todo el sistema.</p>

        <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: '#fff', boxShadow: '0 0 5px rgba(0,0,0,0.1)', borderRadius: '0.5rem' }}>Usuarios</div>
          <div style={{ padding: '1rem', background: '#fff', boxShadow: '0 0 5px rgba(0,0,0,0.1)', borderRadius: '0.5rem' }}>Reportes</div>
          <div style={{ padding: '1rem', background: '#fff', boxShadow: '0 0 5px rgba(0,0,0,0.1)', borderRadius: '0.5rem' }}>Configuración</div>
          <div style={{ padding: '1rem', background: '#fff', boxShadow: '0 0 5px rgba(0,0,0,0.1)', borderRadius: '0.5rem' }}>Logs</div>
        </div>
      </main>
    </div>
  );
}
