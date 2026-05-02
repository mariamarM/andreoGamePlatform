import { router } from '@inertiajs/react';
import React, { useState, useEffect, useRef } from 'react';

interface Message {
    id: number;
    user: {
        id: number;
        name: string;
    } | string;
    content?: string;
    message?: string;
}

interface Props {
    messages: Message[];
    room?: string;
}

export default function GameChat({ messages: initialMessages, room = 'public' }: Props) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [text, setText] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMessages(initialMessages);
    }, [initialMessages]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (window.Echo) {
            window.Echo.channel('chat')
                .listen('MessageSent', (e: any) => {
                    if (e.room === room) {
                        setMessages((prev) => [...prev, {
                            id: e.message.id,
                            user: e.user.name,
                            content: e.message.content || e.message.message
                        }]);
                    }
                });
        }

        return () => {
            if (window.Echo) {
                window.Echo.leave('chat');
            }
        };
    }, []);

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;

        router.post('/chat/messages', {
            message: text,
            room: room,
        }, {
            preserveScroll: true,
            onSuccess: () => setText(''),
        });
    };

    const getUserName = (user: any) => {
        if (typeof user === 'string') return user;
        return user?.name || 'Usuario';
    };

    const getMessageText = (m: Message) => {
        return m.content || m.message || '';
    };

    return (
        <div style={styles.container}>
            <div ref={scrollRef} style={styles.messages}>
                {messages.map((m, idx) => (
                    <div key={m.id || idx} style={styles.message}>
                        <span style={styles.userName}>{getUserName(m.user)}:</span>
                        <span style={styles.messageText}>{getMessageText(m)}</span>
                    </div>
                ))}
            </div>

            <form onSubmit={sendMessage} style={styles.inputBox}>
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    style={styles.input}
                    placeholder="Escribe un mensaje..."
                />
                <button type="submit" style={styles.sendButton}>
                    ➤
                </button>
            </form>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'transparent',
        padding: '15px',
        boxSizing: 'border-box',
    },
    messages: {
        flex: 1,
        overflowY: 'auto',
        fontSize: '13px',
        marginBottom: '15px',
        paddingRight: '5px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    message: {
        background: 'rgba(255, 255, 255, 0.03)',
        padding: '8px 12px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        alignSelf: 'flex-start',
        maxWidth: '90%',
    },
    userName: {
        fontWeight: 'bold',
        color: '#00d4ff',
        marginRight: '8px',
        fontSize: '11px',
        textTransform: 'uppercase',
    },
    messageText: {
        color: 'rgba(255, 255, 255, 0.9)',
        lineHeight: '1.4',
    },
    inputBox: {
        display: 'flex',
        gap: '8px',
        background: 'rgba(0,0,0,0.3)',
        padding: '8px',
        borderRadius: '14px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    input: {
        flex: 1,
        background: 'transparent',
        border: 'none',
        outline: 'none',
        color: '#fff',
        fontSize: '13px',
        padding: '5px',
    },
    sendButton: {
        background: 'transparent',
        border: 'none',
        color: '#00d4ff',
        cursor: 'pointer',
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 5px',
    },
};
