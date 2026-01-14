import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useUser } from '../context/UserContext';

const RankingScreen: React.FC = () => {
    const navigate = useNavigate();
    const { username } = useUser();
    const [period, setPeriod] = useState<'semanal' | 'mensual' | 'total'>('total');

    // Fake Leaderboard Data
    const users = [
        { name: "JuanGamer_99", profit: "+2.45 Ξ", roi: "+156%", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Juan", rank: 1 },
        { name: "ElenaProfit", profit: "+1.89 Ξ", roi: "+89%", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena", rank: 2 },
        { name: "CryptoLatam", profit: "+1.20 Ξ", roi: "+45%", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Crypto", rank: 3 },
        { name: "SatoshiVibes", profit: "+0.95 Ξ", roi: "+32%", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Satoshi", rank: 4 },
        { name: username, profit: "0.00 Ξ", roi: "0%", avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`, rank: 42, isMe: true },
        { name: "BolivarBets", profit: "+0.45 Ξ", roi: "+12%", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Boliv", rank: 5 },
        { name: "TangoTrader", profit: "+0.12 Ξ", roi: "+5%", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tango", rank: 6 },
    ].sort((a, b) => a.rank - b.rank);

    const PodiumItem = ({ user, size }: { user: any, size: 'm' | 'l' }) => (
        <div className={`flex flex-col items-center gap-2 ${size === 'l' ? 'z-10 -mt-8' : 'opacity-80'}`}>
            <div className="relative">
                <div className={`rounded-full border-4 overflow-hidden bg-slate-800 ${size === 'l' ? 'w-24 h-24 border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.3)]' : 'w-16 h-16 border-slate-500 shadow-xl'}`}>
                    <img src={user.avatar} className="w-full h-full object-cover" alt="avatar" />
                </div>
                <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full font-black text-[10px] border-2 border-[#0b0d10] ${user.rank === 1 ? 'bg-yellow-500 text-black' : user.rank === 2 ? 'bg-slate-400 text-black' : 'bg-orange-600 text-white'}`}>
                    #{user.rank}
                </div>
                {user.rank === 1 && <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-2xl animate-bounce">👑</span>}
            </div>
            <div className="text-center mt-2">
                <p className={`font-black tracking-tight leading-none ${size === 'l' ? 'text-lg text-white' : 'text-sm text-slate-300'}`}>{user.name}</p>
                <p className={`font-bold ${size === 'l' ? 'text-emerald-400' : 'text-emerald-500/80'} text-xs mt-1`}>{user.profit}</p>
            </div>
        </div>
    );

    return (
        <div className="bg-[#0b0d10] min-h-screen flex flex-col text-white relative">
            <header className="sticky top-0 z-40 bg-[#0b0d10]/95 backdrop-blur-xl border-b border-white/5 px-4 pt-6 pb-4 shadow-2xl">
                <div className="flex flex-col items-center gap-4">
                    <h2 className="text-2xl font-black tracking-tight">Masters de Latam</h2>

                    <div className="flex bg-[#1c1f26] p-1 rounded-xl w-full max-w-[320px] border border-white/5">
                        {['semanal', 'mensual', 'total'].map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p as any)}
                                className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${period === p ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="flex-1 px-4 py-8 flex flex-col pb-32">
                {/* Podium Section */}
                <div className="flex justify-center items-end gap-1 mb-12 h-48">
                    <PodiumItem user={users[1]} size="m" />
                    <PodiumItem user={users[0]} size="l" />
                    <PodiumItem user={users[2]} size="m" />
                </div>

                <div className="flex flex-col gap-3">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">Clasificación General</h3>

                    {users.slice(3).map((u, i) => (
                        <div
                            key={i}
                            className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${u.isMe ? 'bg-blue-600/10 border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.1)] ring-1 ring-blue-500/20' : 'bg-[#15171b] border-white/5 hover:border-white/10 hover:translate-x-1'}`}
                        >
                            <div className="flex items-center gap-4">
                                <span className={`text-sm font-black w-6 text-center ${u.isMe ? 'text-blue-400' : 'text-slate-600'}`}>{u.rank}</span>
                                <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 overflow-hidden">
                                    <img src={u.avatar} className="w-full h-full object-cover" alt="avatar" />
                                </div>
                                <div className="flex flex-col">
                                    <span className={`text-sm font-bold ${u.isMe ? 'text-blue-400' : 'text-slate-200'}`}>{u.name}</span>
                                    <span className="text-[10px] font-medium text-slate-500 tracking-wide">ROI {u.roi}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block font-black text-sm text-emerald-400">{u.profit}</span>
                                <span className="text-[9px] text-emerald-500/60 font-black uppercase">Profit</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Season Banner */}
                <div className="mt-10 p-6 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 shadow-2xl shadow-blue-900/40 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rotate-45 translate-x-12 -translate-y-12 transition-transform group-hover:scale-120"></div>
                    <div className="relative z-10">
                        <span className="text-[10px] font-black text-blue-100 uppercase tracking-[0.2em] mb-2 block">Fin de Temporada</span>
                        <h4 className="text-xl font-black text-white mb-2">Premios: 10 ETH pool 🏆</h4>
                        <p className="text-sm text-blue-100/70 leading-snug">Los primeros 100 lugares recibirán un drop exclusivo al final del trimestre.</p>
                    </div>
                </div>
            </main>

            <BottomNav />
        </div>
    );
};

export default RankingScreen;