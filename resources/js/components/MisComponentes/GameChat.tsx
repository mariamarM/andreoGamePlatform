import { router } from '@inertiajs/react';
import React, { useState } from 'react';

interface Message {
    id: number;
    user: string;
    message: string;
}

interface Props {
    messages: Message[];
}

export default function GameChat({ messages }: Props) {
    const [text, setText] = useState('');

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();

        router.post('/chat/messages', {
            message: text,
        }, {
            preserveScroll: true,
            onSuccess: () => setText(''),
        });
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>Chat en vivo</div>

            <div style={styles.messages}>
                {messages.map((m) => (
                    <div key={m.id} style={styles.message}>
                        <b>{m.user}:</b> {m.message}
                    </div>
                ))}
            </div>

            <form onSubmit={sendMessage} style={styles.inputBox}>
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    style={styles.input}
                    placeholder="Escribe..."
                />
            </form>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(0,0,0,0.7)',
        borderRadius: '12px',
        padding: '10px',
        color: '#fff',
    },
    header: {
        fontWeight: 'bold',
        marginBottom: '10px',
    },
    messages: {
        flex: 1,
        overflowY: 'auto',
        fontSize: '13px',
        marginBottom: '10px',
    },
    message: {
        marginBottom: '5px',
    },
    inputBox: {
        display: 'flex',
    },
    input: {
        width: '100%',
        padding: '6px',
        borderRadius: '6px',
        border: 'none',
        outline: 'none',
    },
};
