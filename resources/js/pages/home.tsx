import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

export default function Dashboard() {
    const { auth, games } = usePage().props as any;
    const user = auth?.user;

    return (
        <AppLayout>
            <Head title="Dashboard" />

            {/* 🌥️ Fondo animado */}
            <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-blue-400 to-blue-700">
                <div className="cloud cloud-1"></div>
                <div className="cloud cloud-2"></div>
                <div className="cloud cloud-3"></div>
            </div>

            {/* 🔝 Header */}
            <div className="flex justify-between items-center p-6 text-white">
                <h1 className="text-3xl font-bold">🎮 Game Dashboard</h1>

                {!user ? (
                    <div className="flex gap-3">
                        <a href="/login" className="glass-btn">Login</a>
                        <a href="/register" className="glass-btn">Register</a>
                    </div>
                ) : (
                    <div>Hola, {user.name}</div>
                )}
            </div>

            {/* 🎮 Juegos */}
            <div className="p-6 grid md:grid-cols-3 gap-6">
                {games?.map((game: any) => (
                    <div key={game.id} className="glass-card">
                        <h2 className="text-xl font-semibold">{game.title}</h2>
                        <p className="text-sm opacity-80 mt-2">
                            {game.description}
                        </p>

                        <a
                            href={game.url}
                            target="_blank"
                            className="mt-4 inline-block text-blue-200 hover:underline"
                        >
                            Jugar →
                        </a>
                    </div>
                ))}
            </div>

            {/* 🎨 Estilos */}
            <style>{`
                .glass-card {
                    backdrop-filter: blur(20px);
                    background: rgba(255,255,255,0.1);
                    border-radius: 20px;
                    padding: 20px;
                    color: white;
                    border: 1px solid rgba(255,255,255,0.2);
                    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
                }

                .glass-btn {
                    backdrop-filter: blur(10px);
                    background: rgba(255,255,255,0.2);
                    padding: 8px 16px;
                    border-radius: 12px;
                    transition: 0.3s;
                }

                .glass-btn:hover {
                    background: rgba(255,255,255,0.4);
                }

                .cloud {
                    position: absolute;
                    background: url('https://www.transparenttextures.com/patterns/clouds.png');
                    width: 200%;
                    height: 200%;
                    opacity: 0.2;
                    animation: moveClouds 60s linear infinite;
                }

                .cloud-1 { top: 0; left: 0; animation-duration: 60s; }
                .cloud-2 { top: 20%; left: 0; animation-duration: 90s; }
                .cloud-3 { top: 40%; left: 0; animation-duration: 120s; }

                @keyframes moveClouds {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }
            `}</style>
        </AppLayout>
    );
}
