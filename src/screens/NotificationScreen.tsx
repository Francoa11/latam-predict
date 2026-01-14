import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

const NotificationScreen: React.FC = () => {
    const navigate = useNavigate();

    const notifications = [
        { id: 1, title: "🚀 ¡Bienvenido a LatamPredict!", desc: "Tu cuenta ha sido creada con éxito. Empieza a predecir ahora.", time: "Hace 1h", icon: "celebration", color: "blue" },
        { id: 2, title: "✅ Transacción Confirmada", desc: "Tu compra de 10.00 USD en el mercado de 'Bitcoin' fue procesada.", time: "Hace 3h", icon: "check_circle", color: "emerald" },
        { id: 3, title: "🔥 Tendencia en Latam", desc: "¿Vuelve el crecimiento a la región? Las odds de Milei se están moviendo.", time: "Hace 5h", icon: "trending_up", color: "purple" },
        { id: 4, title: "💳 Depósito Recibido", desc: "Has recibido 50.00 USDT en tu billetera de Polygon.", time: "Ayer", icon: "wallet", color: "orange" },
    ];

    return (
        <div className="bg-[#0b0d10] min-h-screen flex flex-col text-white pb-24">
            <header className="sticky top-0 z-40 bg-[#0b0d10]/95 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center gap-4 w-full max-w-[480px] mx-auto">
                <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5">
                    <span className="material-symbols-outlined text-slate-400">arrow_back</span>
                </button>
                <h2 className="text-sm font-black uppercase tracking-[0.2em]">Notificaciones</h2>
            </header>

            <main className="flex-1 p-6 flex flex-col gap-4 w-full max-w-[480px] mx-auto">
                {notifications.length > 0 ? (
                    notifications.map((n) => (
                        <div key={n.id} className="flex gap-4 p-5 rounded-3xl bg-[#15171b] border border-white/5 active:bg-[#1a1d21] transition-all cursor-pointer shadow-sm">
                            <div className="w-12 h-12 shrink-0 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
                                <span className="material-symbols-outlined text-blue-400">{n.icon}</span>
                            </div>
                            <div className="flex-1 flex flex-col gap-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-sm font-black text-white">{n.title}</h3>
                                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{n.time}</span>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed font-medium">{n.desc}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-40 text-slate-500 gap-4 opacity-50">
                        <span className="material-symbols-outlined text-6xl">notifications_off</span>
                        <p className="text-sm font-black uppercase tracking-widest">Sin novedades</p>
                    </div>
                )}
            </main>
            <BottomNav />
        </div>
    );
};

export default NotificationScreen;
