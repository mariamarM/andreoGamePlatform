import { useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';

interface User {
    id: number;
    name: string;
    profile_photo_url?: string;
    role_id: number;
}

interface Message {
    id: number;
    content: string;
    user_id: number;
    created_at: string;
    updated_at: string;
    user: User;
}

interface StaffChatProps {
    messages: Message[];
    user: User;
}

interface FormData {
    content: string;
}

export default function StaffChat({ messages: initialMessages, user }: StaffChatProps) {
    const [messages] = useState<Message[]>(initialMessages);

    const { data, setData, post, processing, errors, reset } =
        useForm<FormData>({
            content: '',
        });

    const sendMessage = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/staff-chat/messages', {
            preserveScroll: true,
            onSuccess: () => {
                reset('content');
            },
        });
    };

    const formatDate = (date: string): string => {
        return new Date(date).toLocaleString();
    };

    const getRoleName = (role_id: number) => {
        if (role_id === 1) return 'Admin';
        if (role_id === 2) return 'Gestor';
        return 'Staff';
    };

    return (
        <AppLayout>
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-800">
                            Sala chat privada
                        </h2>
                        <a href={user.role_id === 1 ? '/admin' : '/gestor'} className="text-sm text-indigo-600 hover:underline">
                            &larr; Volver al Panel
                        </a>
                    </div>

                    <div className="overflow-hidden bg-gray-50 p-6 shadow-xl ring-1 ring-gray-900/5 sm:rounded-lg">
                        <div className="mb-4 rounded-md bg-blue-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3 flex-1 md:flex md:justify-between">
                                    <p className="text-sm text-blue-700">Esta es una sala privada exclusivamente para la coordinación de Administradores y Gestores.</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={sendMessage} className="mb-6 border-b border-gray-200 pb-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Mensaje Interno
                                </label>
                                <textarea
                                    value={data.content}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLTextAreaElement>,
                                    ) => setData('content', e.target.value)}
                                    className="focus:ring-opacity-50 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200"
                                    rows={3}
                                    placeholder="Escribe un mensaje al equipo..."
                                />
                                {errors.content && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.content}
                                    </p>
                                )}
                            </div>
                            <button
                                type="submit"
                                className="rounded bg-indigo-600 px-4 py-2 font-bold text-white hover:bg-indigo-700 transition"
                                disabled={processing}
                            >
                                Enviar al Equipo
                            </button>
                        </form>

                        {messages.length > 0 ? (
                            <div className="space-y-4">
                                {messages.map((message: Message) => (
                                    <div key={message.id} className="flex bg-white p-4 rounded-lg shadow-sm">
                                        <div className="mr-4 shrink-0">
                                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                                                {message.user.name.charAt(0).toUpperCase()}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="flex items-center">
                                                <b className="text-gray-900">{message.user.name}</b>
                                                <span className="ml-2 inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                                    {getRoleName(message.user.role_id)}
                                                </span>
                                                <span className="ml-auto text-xs text-gray-500">
                                                    {formatDate(
                                                        message.created_at,
                                                    )}
                                                </span>
                                            </p>
                                            <div className="mt-1 text-gray-700 whitespace-pre-wrap">{message.content}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center text-gray-500">
                                No hay mensajes en el canal del staff todavia
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
