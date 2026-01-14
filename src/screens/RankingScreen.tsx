import React from 'react';
import BottomNav from '../components/BottomNav';
import { useUser } from '../context/UserContext';

const RankingScreen: React.FC = () => {
    const { username } = useUser();

    const leaderboard = [
        { rank: 1, name: "CryptoWhale_26", profit: "+12.5K Ξ", level: "Leyenda", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Crypto" },
        { rank: 2, name: "Predictor_Pro", profit: "+8.2K Ξ", level: "Experto", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Predictor" },
        { rank: 3, name: "Milei_Bull", profit: "+5.1K Ξ", level: "Elite", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Milei" },
        { rank: 4, name: "LatamTrader", profit: "+3.8K Ξ", level: "Elite", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Latam" },
        { rank: 5, name: username, profit: "+1.2K Ξ", level: "Novato", avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`, current: true },
    ];

    return (
        <div className="bg-[#0b0d10] min-h-screen flex flex-col pb-24 text-white">
            <header className="sticky top-0 z-40 bg-[#0b0d10]/95 backdrop-blur-xl border-b border-white/5 p-4 flex flex-col gap-1">
                <h2 className="text-2xl font-black tracking-tight">Global Ranking</h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Los mejores de 2026</p>
            </header>

            <main className="flex-1 p-4 flex flex-col gap-4">
                <div className="flex justify-center gap-4 py-6 mb-2">
                    {/* Top 3 Mock Podium */}
                    <div className="flex flex-col items-center pt-8">
                        <div className="w-16 h-16 rounded-full border-2 border-slate-400 overflow-hidden mb-2">
                            <img src={leaderboard[1].avatar} alt="avatar" />
                        </div>
                        <span className="text-xs font-black">#2</span>
                    </div>
                    <div className="flex flex-col items-center scale-110">
                        <div className="w-20 h-20 rounded-full border-4 border-yellow-500 overflow-hidden mb-2 shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                            <img src={leaderboard[0].avatar} alt="avatar" />
                        </div>
                        <span className="text-sm font-black text-yellow-500">🏆</span>
                    </div>
                    <div className="flex flex-col items-center pt-8">
                        <div className="w-16 h-16 rounded-full border-2 border-orange-800 overflow-hidden mb-2">
                            <img src={leaderboard[2].avatar} alt="avatar" />
                        </div>
                        <span className="text-xs font-black">#3</span>
                    </div>
                </div>

                <div className="bg-[#15171b] rounded-[32px] border border-white/5 overflow-hidden">
                    {leaderboard.map((user, idx) => (
                        <div key={user.name} className={`flex items-center gap-4 p-4 border-b border-white/5 last:border-0 ${user.current ? 'bg-blue-600/10' : ''}`}>
                            <span className={`w-6 text-center text-sm font-black ${idx < 3 ? 'text-blue-500' : 'text-slate-600'}`}>
                                {user.rank}
                            </span>
                            <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden shrink-0 border border-white/10">
                                <img src={user.avatar} alt="avatar" />
                            </div>
                            <div className="flex flex-col flex-1">
                                <span className="text-sm font-black">{user.name}</span>
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{user.level}</span>
                            </div>
                            <span className="text-sm font-black text-emerald-400">{user.profit}</span>
                        </div>
                    ))}
                </div>
            </main>
            <BottomNav />
        </div>
    );
};

export default RankingScreen;