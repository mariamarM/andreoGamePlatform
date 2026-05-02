import { Head, Link, useForm } from '@inertiajs/react';
import React from 'react';

interface Game {
    id: number;
    title: string;
    description: string;
    url: string;
    is_published: boolean;
}

interface Props {
    game: Game;
}

export default function GestorEdit({ game }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        title: game.title,
        description: game.description,
        url: game.url,
        is_published: game.is_published,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/gestor/games/${game.id}`);
    };

    return (
        <div style={styles.container}>
            <Head title={`Editar: ${game.title}`} />
            <div style={styles.header}>
                <h1 style={styles.title}>Editar Juego</h1>
                <Link href="/gestor/games" style={styles.backLink}>← Volver</Link>
            </div>

            <main style={styles.main}>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Título del Juego</label>
                        <input
                            value={data.title}
                            onChange={e => setData('title', e.target.value)}
                            style={styles.input}
                        />
                        {errors.title && <span style={styles.error}>{errors.title}</span>}
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Descripción</label>
                        <textarea
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            style={styles.textarea}
                        />
                        {errors.description && <span style={styles.error}>{errors.description}</span>}
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>URL del Juego</label>
                        <input
                            value={data.url}
                            onChange={e => setData('url', e.target.value)}
                            style={styles.input}
                        />
                        {errors.url && <span style={styles.error}>{errors.url}</span>}
                    </div>

                    <div style={styles.checkboxGroup}>
                        <input
                            type="checkbox"
                            checked={data.is_published}
                            onChange={e => setData('is_published', e.target.checked)}
                            id="is_published"
                        />
                        <label htmlFor="is_published" style={styles.checkboxLabel}>Publicado</label>
                    </div>

                    <button type="submit" disabled={processing} style={styles.submitButton}>
                        {processing ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </form>
            </main>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        padding: '40px',
        background: '#f8fafc',
        minHeight: '100vh',
        fontFamily: "'Inter', sans-serif",
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '600px',
        margin: '0 auto 30px auto',
    },
    title: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#0f172a',
    },
    backLink: {
        color: '#64748b',
        textDecoration: 'none',
        fontSize: '14px',
    },
    main: {
        maxWidth: '600px',
        margin: '0 auto',
    },
    form: {
        background: '#fff',
        padding: '30px',
        borderRadius: '16px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    label: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#334155',
    },
    input: {
        padding: '12px',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        fontSize: '14px',
        outline: 'none',
    },
    textarea: {
        padding: '12px',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        fontSize: '14px',
        outline: 'none',
        minHeight: '120px',
        fontFamily: 'inherit',
    },
    checkboxGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    checkboxLabel: {
        fontSize: '14px',
        color: '#64748b',
    },
    submitButton: {
        background: '#0f172a',
        color: '#fff',
        padding: '14px',
        borderRadius: '10px',
        border: 'none',
        fontWeight: 'bold',
        fontSize: '16px',
        cursor: 'pointer',
        marginTop: '10px',
    },
    error: {
        fontSize: '12px',
        color: '#ef4444',
    },
};