import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useToast } from '../context/ToastContext';
import { useBlockchain } from '../context/BlockchainContext';
import { useUser } from '../context/UserContext';
import { usePrivy } from '@privy-io/react-auth';

const ProfileScreen: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { logout, user } = usePrivy();
    const { account } = useBlockchain();
    const { username, setUsername } = useUser();

    const [isEditing, setIsEditing] = useState(false);
    const [tempName, setTempName] = useState(username);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const saveName = () => {
        if (tempName.trim()) {
            setUsername(tempName);
            setIsEditing(false);
            showToast("✅ Nombre de usuario actualizado");
        }
    };

    // Identificador visual
    const displayId = user?.id ? user.id.slice(0, 8) : "---";

    const menuItems = [
        { icon: 'person', text: 'Datos Personales', path: 'datos-personales' },
        { icon: 'verified_user', text: 'Verificación de Identidad', badge: 'Verificado', path: 'verificacion' },
        { icon: 'credit_card', text: 'Métodos de Pago', path: 'pagos' },
        { icon: 'notifications', text: 'Notificaciones', path: '/notifications' },
        { icon: 'support_agent', text: 'Ayuda y Soporte', path: '/support' },
    ];

    return (
        <div className="relative flex h-full min-h-screen w-full flex-col bg-[#0b0d10] text-white pb-24">
            <header className="sticky top-0 z-20 flex items-center bg-[#0b0d10]/95 backdrop-blur-xl p-4 border-b border-white/5">
                <h2 className="text-lg font-bold flex-1 text-center pl-8">Mi Perfil</h2>
                <button onClick={handleLogout} className="text-xs font-bold text-red-500 hover:text-red-400 p-2 transition-colors">Salir</button>
            </header>

            <main className="p-5 flex flex-col gap-8">
                {/* Header Profile */}
                <div className="flex items-center gap-5 pb-2">
                    <div className="w-20 h-20 rounded-full bg-slate-700 bg-cover bg-center border-2 border-white/10 shadow-lg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop')" }}></div>
                    <div className="flex flex-col flex-1">
                        {isEditing ? (
                            <div className="flex items-center gap-2">
                                <input
                                    value={tempName}
                                    onChange={(e) => setTempName(e.target.value)}
                                    className="bg-[#1c1f26] border border-blue-500/50 rounded-lg px-2 py-1 text-white text-lg font-bold w-full outline-none"
                                    autoFocus
                                />
                                <button onClick={saveName} className="text-emerald-400 p-1">
                                    <span className="material-symbols-outlined">check</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold tracking-tight text-white break-all line-clamp-1">{username}</h1>
                                <button onClick={() => setIsEditing(true)} className="text-slate-500 hover:text-white transition-colors">
                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                </button>
                            </div>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-500/10 text-xs font-bold text-blue-400 border border-blue-500/20">
                                Nivel: Novato
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold font-mono">ID: {displayId}</span>
                        </div>
                    </div>
                </div>

                {/* Balance Card */}
                <div className="bg-blue-600 text-white rounded-2xl p-6 shadow-xl shadow-blue-900/20 relative overflow-hidden ring-1 ring-white/10">
                    <div className="absolute -top-4 -right-4 p-4 opacity-10 rotate-12 pointer-events-none">
                        <span className="material-symbols-outlined text-[100px]">account_balance_wallet</span>
                    </div>
                    <div className="relative z-10">
                        <span className="text-xs font-bold text-blue-100 uppercase tracking-wider mb-1 block">Saldo Total</span>
                        <div className="flex items-end justify-between">
                            <h2 className="text-3xl font-black tracking-tight">$0.00</h2>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => navigate('/deposit')} className="flex-1 bg-white text-blue-600 py-3 rounded-xl text-sm font-bold shadow-md active:scale-95 active:bg-slate-100 transition-all flex items-center justify-center gap-1">
                                <span className="material-symbols-outlined text-lg">add</span> Depositar
                            </button>
                            <button onClick={() => navigate('/withdraw')} className="flex-1 bg-black/20 text-white py-3 rounded-xl text-sm font-bold hover:bg-black/30 active:scale-95 transition-all border border-white/10 flex items-center justify-center gap-1">
                                <span className="material-symbols-outlined text-lg">arrow_upward</span> Retirar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Config List */}
                <div className="flex flex-col gap-3">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Configuración</h3>
                    <div className="bg-[#15171b] rounded-2xl border border-white/5 overflow-hidden shadow-sm">
                        <button onClick={() => navigate('/portfolio')} className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors border-b border-white/5 text-left group active:bg-white/10">
                            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-colors">
                                <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                            </div>
                            <span className="text-[14px] font-semibold flex-1 text-slate-200 group-hover:text-white transition-colors">Mi Cartera</span>
                            <span className="material-symbols-outlined text-slate-500 text-lg group-hover:translate-x-1 transition-transform">chevron_right</span>
                        </button>
                        {menuItems.map((item, i) => (
                            <button
                                key={i}
                                onClick={() => item.path.startsWith('/') ? navigate(item.path) : navigate(`/settings/${item.path}`)}
                                className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 text-left group active:bg-white/10"
                            >
                                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                                </div>
                                <span className="text-[14px] font-semibold flex-1 text-slate-200 group-hover:text-white transition-colors">{item.text}</span>
                                {item.badge && <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full mr-2">{item.badge}</span>}
                                <span className="material-symbols-outlined text-slate-500 text-lg group-hover:translate-x-1 transition-transform">chevron_right</span>
                            </button>
                        ))}
                        <button onClick={handleLogout} className="w-full flex items-center gap-4 p-4 hover:bg-red-500/5 transition-colors text-left group active:bg-red-500/10">
                            <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 transition-colors">
                                <span className="material-symbols-outlined text-[20px]">logout</span>
                            </div>
                            <span className="text-[14px] font-semibold flex-1 text-red-400 group-hover:text-red-300 transition-colors">Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            </main>
            <BottomNav />
        </div>
    );
};

export default ProfileScreen;