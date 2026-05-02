import { Head, Link, router, useForm } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';

interface Conversation {
    room: string;
    name: string;
    last_message_at: string | null;
}

interface Message {
    id: number;
    content: string;
    user_id: number;
    user: {
        id: number;
        name: string;
    };
    created_at: string;
}

interface Props {
    conversations: Conversation[];
    messages: Message[];
    activeRoom: string | null;
    user: {
        id: number;
        name: string;
        role_id: number;
    };
}

export default function ChatIndex({ conversations, messages: initialMessages, activeRoom, user }: Props) {
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

    // Real-time listener
    useEffect(() => {
        if (window.Echo && activeRoom) {
            window.Echo.channel('chat')
                .listen('MessageSent', (e: any) => {
                    if (e.room === activeRoom) {
                        setMessages((prev) => [...prev, {
                            id: e.message.id,
                            user: { id: e.user.id, name: e.user.name },
                            content: e.message.content,
                            created_at: e.message.created_at,
                            user_id: e.user.id
                        }]);
                    }
                });
        }
        return () => {
            if (window.Echo) window.Echo.leave('chat');
        };
    }, [activeRoom]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() || !activeRoom) return;

        router.post('/chat/messages', {
            message: text,
            room: activeRoom
        }, {
            preserveScroll: true,
            onSuccess: () => setText('')
        });
    };

    return (
        <div style={styles.container}>
            <Head title="Mensajería" />
            
            <div style={styles.appWrap}>
                {/* Sidebar */}
                <div style={styles.sidebar}>
                    <div style={styles.sidebarHeader}>
                        <Link href="/" style={styles.backBtn}>←</Link>
                        <h2 style={styles.sidebarTitle}>Chats</h2>
                    </div>
                    <div style={styles.convList}>
                        {conversations.map((conv) => (
                            <Link
                                key={conv.room}
                                href={`/chat?room=${conv.room}`}
                                style={{
                                    ...styles.convItem,
                                    background: activeRoom === conv.room ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
                                }}
                            >
                                <div style={styles.avatar}>{conv.name.charAt(0)}</div>
                                <div style={styles.convInfo}>
                                    <div style={styles.convName}>{conv.name}</div>
                                    <div style={styles.convDate}>{conv.last_message_at ? new Date(conv.last_message_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Main Chat */}
                <div style={styles.mainChat}>
                    {activeRoom ? (
                        <>
                            <div style={styles.chatHeader}>
                                <div style={styles.activeAvatar}>
                                    {conversations.find(c => c.room === activeRoom)?.name.charAt(0) || '?'}
                                </div>
                                <div style={styles.activeTitle}>
                                    {conversations.find(c => c.room === activeRoom)?.name || 'Conversación'}
                                </div>
                            </div>
                            
                            <div style={styles.messageArea} ref={scrollRef}>
                                {messages.map((msg) => (
                                    <div 
                                        key={msg.id} 
                                        style={{
                                            ...styles.messageWrap,
                                            justifyContent: msg.user_id === user.id ? 'flex-end' : 'flex-start'
                                        }}
                                    >
                                        <div style={{
                                            ...styles.messageBubble,
                                            background: msg.user_id === user.id ? '#0084ff' : 'rgba(255, 255, 255, 0.1)',
                                            borderRadius: msg.user_id === user.id ? '18px 18px 2px 18px' : '18px 18px 18px 2px'
                                        }}>
                                            {msg.user_id !== user.id && <div style={styles.senderName}>{msg.user.name}</div>}
                                            <div style={styles.msgText}>{msg.content}</div>
                                            <div style={styles.msgTime}>
                                                {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <form onSubmit={handleSendMessage} style={styles.inputArea}>
                                <input
                                    type="text"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Escribe un mensaje..."
                                    style={styles.input}
                                />
                                <button type="submit" style={styles.sendBtn}>➤</button>
                            </form>
                        </>
                    ) : (
                        <div style={styles.emptyState}>
                            <div style={styles.emptyIcon}>💬</div>
                            <p>Selecciona una conversación para empezar</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        height: '100vh',
        width: '100%',
        background: '#0a0a0c',
        color: '#fff',
        fontFamily: "'Outfit', sans-serif",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box',
    },
    appWrap: {
        width: '100%',
        maxWidth: '1200px',
        height: '90vh',
        background: 'rgba(23, 23, 28, 0.8)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        overflow: 'hidden',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
    },
    sidebar: {
        width: '320px',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
    },
    sidebarHeader: {
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    },
    backBtn: {
        fontSize: '20px',
        color: '#fff',
        textDecoration: 'none',
        opacity: 0.6,
    },
    sidebarTitle: {
        margin: 0,
        fontSize: '18px',
        fontWeight: 600,
    },
    convList: {
        flex: 1,
        overflowY: 'auto',
    },
    convItem: {
        display: 'flex',
        padding: '15px 20px',
        gap: '15px',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
    },
    avatar: {
        width: '45px',
        height: '45px',
        background: 'linear-gradient(45deg, #00d4ff, #0082ff)',
        borderRadius: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        fontWeight: 'bold',
        flexShrink: 0,
    },
    convInfo: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '4px',
    },
    convName: {
        fontWeight: 600,
        fontSize: '15px',
    },
    convDate: {
        fontSize: '11px',
        color: 'rgba(255, 255, 255, 0.4)',
    },
    mainChat: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(0, 0, 0, 0.1)',
    },
    chatHeader: {
        padding: '15px 25px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    },
    activeAvatar: {
        width: '35px',
        height: '35px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: 'bold',
    },
    activeTitle: {
        fontWeight: 600,
        fontSize: '16px',
    },
    messageArea: {
        flex: 1,
        padding: '25px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    messageWrap: {
        display: 'flex',
        width: '100%',
    },
    messageBubble: {
        maxWidth: '70%',
        padding: '12px 16px',
        position: 'relative',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    },
    senderName: {
        fontSize: '10px',
        fontWeight: 700,
        color: '#00d4ff',
        marginBottom: '4px',
        textTransform: 'uppercase',
    },
    msgText: {
        fontSize: '14px',
        lineHeight: '1.5',
    },
    msgTime: {
        fontSize: '9px',
        textAlign: 'right',
        marginTop: '4px',
        opacity: 0.5,
    },
    inputArea: {
        padding: '20px 25px',
        display: 'flex',
        gap: '15px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    },
    input: {
        flex: 1,
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '14px',
        padding: '12px 20px',
        color: '#fff',
        fontSize: '14px',
        outline: 'none',
    },
    sendBtn: {
        background: '#0084ff',
        color: '#fff',
        border: 'none',
        borderRadius: '14px',
        width: '45px',
        height: '45px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: '18px',
        transition: 'transform 0.2s ease',
    },
    emptyState: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.3,
        textAlign: 'center',
    },
    emptyIcon: {
        fontSize: '60px',
        marginBottom: '20px',
    },
};
