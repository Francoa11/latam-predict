import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

const NotificationScreen: React.FC = () => {
    const navigate = useNavigate();

    const notifications = [
        { id: 1, title: "🚀 ¡Bienvenido a LatamPredict!", desc: "Tu cuenta ha sido creada con éxito. Empieza a predecir ahora.", time: "Hace 1h", icon: "celebration", color: "blue" },
        { id: 2, title: "✅ Transacción Confirmada", desc: "Tu apuesta de 0.001 ETH en 'Messi 2026' fue procesada.", time: "Hace 3h", icon: "check_circle", color: "emerald" },
        { id: 3, title: "🔥 Tendencia en Tech", desc: "¿AGI en 2025? Las odds se están moviendo rápido.", time: "Hace 5h", icon: "trending_up", color: "purple" },
        { id: 4, title: "💳 Depósito Recibido", desc: "Has recibido 0.05 ETH en tu billetera de Sepolia.", time: "Ayer", icon: "wallet", color: "orange" },
    ];

    return (
        <div className="bg-[#0b0d10] min-h-screen flex flex-col text-white pb-24">
            <header className="sticky top-0 z-40 bg-[#0b0d10]/95 backdrop-blur-xl border-b border-white/5 px-4 py-4 flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/5">
                    <span className="material-symbols-outlined text-slate-400">arrow_back</span>
                </button>
                <h2 className="text-xl font-bold">Notificaciones</h2>
            </header>

            <main className="flex-1 p-4 flex flex-col gap-4">
                {notifications.length > 0 ? (
                    notifications.map((n) => (
                        <div key={n.id} className="flex gap-4 p-4 rounded-2xl bg-[#15171b] border border-white/5 active:bg-[#1a1d21] transition-all cursor-pointer">
                            <div className={`w-12 h-12 shrink-0 rounded-xl bg-${n.color}-500/10 flex items-center justify-center text-${n.color}-500 border border-${n.color}-500/20`}>
                                <span className="material-symbols-outlined">{n.icon}</span>
                            </div>
                            <div className="flex-1 flex flex-col gap-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-sm font-bold text-slate-100">{n.title}</h3>
                                    <span className="text-[10px] text-slate-500 font-medium">{n.time}</span>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">{n.desc}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-40 text-slate-500 gap-4 opacity-50">
                        <span className="material-symbols-outlined text-6xl">notifications_off</span>
                        <p className="font-bold">Todo al día por aquí</p>
                    </div>
                )}
            </main>
            <BottomNav />
        </div>
    );
};

export default NotificationScreen;
