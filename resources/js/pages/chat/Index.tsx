import { useForm } from '@inertiajs/react';
import React from 'react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';

interface User {
    id: number;
    name: string;
    profile_photo_url?: string;
}

interface Message {
    id: number;
    content: string;
    user_id: number;
    created_at: string;
    updated_at: string;
    user: User;
}

interface IndexProps {
    messages: Message[];
    user: User;
}

interface FormData {
    content: string;
}

export default function Index({ messages: initialMessages }: IndexProps) {
    const [messages] = useState<Message[]>(initialMessages);

    const { data, setData, post, processing, errors, reset } =
        useForm<FormData>({
            content: '',
        });

    const sendMessage = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/chat/messages', {
            preserveScroll: true,
            onSuccess: () => {
                reset('content');
            },
        });
    };

    const formatDate = (date: string): string => {
        return new Date(date).toLocaleString();
    };

    return (
        <AppLayout>
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white p-6 shadow-xl sm:rounded-lg">
                        <form onSubmit={sendMessage} className="mb-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Mensaje
                                </label>
                                <textarea
                                    value={data.content}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLTextAreaElement>,
                                    ) => setData('content', e.target.value)}
                                    className="focus:ring-opacity-50 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200"
                                    rows={3}
                                    placeholder="Escribe un mensaje..."
                                />
                                {errors.content && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.content}
                                    </p>
                                )}
                            </div>
                            <button
                                type="submit"
                                className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
                                disabled={processing}
                            >
                                Enviar
                            </button>
                        </form>

                        {messages.length > 0 ? (
                            <div className="space-y-4">
                                {messages.map((message: Message) => (
                                    <div key={message.id} className="flex">
                                        <div className="mr-4 shrink-0">
                                            <img
                                                className="h-8 w-8 rounded-full object-cover"
                                                src={
                                                    message.user
                                                        .profile_photo_url
                                                }
                                                alt={message.user.name}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <p>
                                                <b>{message.user.name}</b>
                                                <span className="ml-2 text-xs text-gray-500">
                                                    {formatDate(
                                                        message.created_at,
                                                    )}
                                                </span>
                                            </p>
                                            <div>{message.content}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center text-gray-500">
                                No hay mensajes aún. ¡Sé el primero en enviar
                                uno!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
