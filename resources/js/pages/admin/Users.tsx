import { Head, useForm, router, Link } from '@inertiajs/react';
import React, { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { showToast } from '@/utils/toast';

interface User {
    id: number;
    name: string;
    email: string;
    role_id: number;
    role: {
        id: number;
        name: string;
    };
}

interface Role {
    id: number;
    name: string;
}

interface Props {
    users: User[];
    roles: Role[];
    user: any; // Authenticated user for layout
}

export default function Users({ users, roles }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        role_id: 3,
    });

    const openCreateModal = () => {
        setEditingUser(null);
        reset();
        setIsModalOpen(true);
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setData({
            name: user.name,
            email: user.email,
            password: '',
            role_id: user.role_id,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            put(`/admin/users/${editingUser.id}`, {
                onSuccess: () => {
                    closeModal();
                    showToast('Usuario actualizado correctamente');
                },
            });
        } else {
            post('/admin/users', {
                onSuccess: () => {
                    closeModal();
                    showToast('Usuario creado correctamente');
                },
            });
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de eliminar este usuario?')) {
            destroy(`/admin/users/${id}`, {
                onSuccess: () => showToast('Usuario eliminado', 'error')
            });
        }
    };

    return (
        <DashboardLayout title="Gestión de Usuarios">
            <Head title="Gestión de Usuarios" />
            <div style={styles.header}>
                <div style={styles.titleWrap}>
                    <Link href="/admin" style={styles.backLink}>←</Link>
                    <h1 style={styles.title}>Usuarios</h1>
                </div>
                <button onClick={openCreateModal} style={styles.createButton}>
                    Añadir Usuario
                </button>
            </div>

            <div style={styles.tableWrap}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>ID</th>
                            <th style={styles.th}>Nombre</th>
                            <th style={styles.th}>Email</th>
                            <th style={styles.th}>Rol</th>
                            <th style={styles.th}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u.id} style={styles.tr}>
                                <td style={styles.td}>{u.id}</td>
                                <td style={styles.td}>{u.name}</td>
                                <td style={styles.td}>{u.email}</td>
                                <td style={styles.td}>
                                    <span style={{
                                        ...styles.roleBadge,
                                        background: u.role_id === 1 ? 'rgba(239, 68, 68, 0.2)' : u.role_id === 2 ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                        color: u.role_id === 1 ? '#ef4444' : u.role_id === 2 ? '#3b82f6' : '#10b981',
                                        border: `1px solid ${u.role_id === 1 ? '#ef4444' : u.role_id === 2 ? '#3b82f6' : '#10b981'}`
                                    }}>
                                        {u.role?.name || 'Usuario'}
                                    </span>
                                </td>
                                <td style={styles.td}>
                                    <button onClick={() => openEditModal(u)} style={styles.editBtn}>Editar</button>
                                    <button onClick={() => handleDelete(u.id)} style={styles.deleteBtn}>Borrar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <h2 style={styles.modalTitle}>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Nombre</label>
                                <input
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    style={styles.input}
                                />
                                {errors.name && <span style={styles.error}>{errors.name}</span>}
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Email</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    style={styles.input}
                                />
                                {errors.email && <span style={styles.error}>{errors.email}</span>}
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Contraseña</label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Rol</label>
                                <select
                                    value={data.role_id}
                                    onChange={e => setData('role_id', parseInt(e.target.value))}
                                    style={styles.input}
                                >
                                    {roles.map(role => (
                                        <option key={role.id} value={role.id}>{role.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={styles.modalActions}>
                                <button type="button" onClick={closeModal} style={styles.cancelBtn}>Cancelar</button>
                                <button type="submit" disabled={processing} style={styles.saveBtn}>
                                    {editingUser ? 'Guardar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

const styles: Record<string, React.CSSProperties> = {
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
    },
    titleWrap: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
    },
    backLink: {
        textDecoration: 'none',
        color: '#1e293b',
        fontSize: '24px',
        fontWeight: 'bold',
    },
    title: {
        fontSize: '24px',
        fontWeight: 800,
        color: '#1e293b',
        margin: 0,
    },
    createButton: {
        background: '#fff',
        color: '#1e293b',
        padding: '10px 20px',
        borderRadius: '12px',
        border: '1px solid rgba(0,0,0,0.1)',
        fontWeight: 700,
        cursor: 'pointer',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    },
    tableWrap: {
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        overflow: 'hidden',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    th: {
        textAlign: 'left',
        padding: '15px 20px',
        background: 'rgba(255, 255, 255, 0.2)',
        color: '#1e293b',
        fontSize: '11px',
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: '1px',
    },
    tr: {
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    },
    td: {
        padding: '15px 20px',
        color: '#1e293b',
        fontSize: '13px',
        fontWeight: 500,
    },
    roleBadge: {
        padding: '4px 10px',
        borderRadius: '8px',
        fontSize: '10px',
        fontWeight: 800,
        textTransform: 'uppercase',
    },
    editBtn: {
        color: '#3b82f6',
        background: 'none',
        border: 'none',
        marginRight: '15px',
        cursor: 'pointer',
        fontWeight: 700,
    },
    deleteBtn: {
        color: '#ef4444',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 700,
    },
    modalOverlay: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.2)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    modalContent: {
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '30px',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '400px',
        border: '1px solid #fff',
        boxShadow: '0 30px 60px rgba(0,0,0,0.2)',
    },
    modalTitle: {
        margin: '0 0 20px 0',
        fontSize: '20px',
        fontWeight: 800,
        color: '#1e293b',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
    },
    label: {
        fontSize: '11px',
        fontWeight: 700,
        color: '#64748b',
    },
    input: {
        padding: '12px',
        borderRadius: '10px',
        border: '1px solid rgba(0,0,0,0.1)',
        background: '#fff',
        fontSize: '14px',
        outline: 'none',
    },
    error: {
        fontSize: '11px',
        color: '#ef4444',
    },
    modalActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
        marginTop: '10px',
    },
    cancelBtn: {
        padding: '10px 20px',
        borderRadius: '10px',
        border: 'none',
        background: 'rgba(0,0,0,0.05)',
        cursor: 'pointer',
        fontWeight: 600,
    },
    saveBtn: {
        padding: '10px 20px',
        borderRadius: '10px',
        border: 'none',
        background: '#1e293b',
        color: '#fff',
        fontWeight: 700,
        cursor: 'pointer',
    },
};
