import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useBlockchain } from '../context/BlockchainContext';
import { ethers } from 'ethers';

const ExploreScreen: React.FC = () => {
    const navigate = useNavigate();
    const { contract } = useBlockchain();
    const [activeTab, setActiveTab] = useState('Todo');
    const [searchQuery, setSearchQuery] = useState('');
    const [markets, setMarkets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const CATEGORIES = ['Todo', 'Política', 'Economía', 'Deportes', 'Tech', 'Cripto'];

    useEffect(() => {
        const loadMarkets = async () => {
            setLoading(true);
            try {
                const mocks = [
                    { id: "m1", title: "¿Bitcoin superará los $150k en 2026?", category: "Cripto", yes: 65, vol: "128.5 Ξ", img: "https://picsum.photos/seed/btc/100" },
                    { id: "m2", title: "¿Argentina ganará el mundial 2026?", category: "Deportes", yes: 48, vol: "450.0 Ξ", img: "https://picsum.photos/seed/arg/100" },
                    { id: "m3", title: "¿Elon Musk llegará a Marte antes de 2027?", category: "Tech", yes: 12, vol: "89.1 Ξ", img: "https://picsum.photos/seed/mars/100" }
                ];

                if (contract) {
                    const data = await contract.allMarkets();
                    if (data && data.length > 0) {
                        const formatted = data.map((m: any) => {
                            const y = Number(ethers.formatUnits(m.yesVotes, 6));
                            const n = Number(ethers.formatUnits(m.noVotes, 6));
                            const total = y + n;
                            const title = m.question;

                            // Simple heuristic for category
                            let cat = "General";
                            const t = title.toLowerCase();
                            if (t.includes("bitcoin") || t.includes("crypto") || t.includes("btc") || t.includes("eth")) cat = "Cripto";
                            else if (t.includes("argentina") || t.includes("mundial") || t.includes("messi") || t.includes("fútbol")) cat = "Deportes";
                            else if (t.includes("inflación") || t.includes("dólar") || t.includes("economía") || t.includes("pbi")) cat = "Economía";
                            else if (t.includes("elon") || t.includes("mars") || t.includes("tech") || t.includes("ai")) cat = "Tech";
                            else if (t.includes("elecciones") || t.includes("política") || t.includes("presidente")) cat = "Política";

                            return {
                                id: Number(m.id),
                                title: title,
                                category: cat,
                                yes: total === 0 ? 50 : Math.round((y / total) * 100),
                                vol: total.toFixed(2) + " vol",
                                img: `https://picsum.photos/seed/${Number(m.id)}/200`
                            };
                        });
                        // Combine with mocks if needed, or just use real data. 
                        // For now, let's show Real Data FIRST, then Mocks if you want, or just Real.
                        // User wants to see the Seed markets.
                        setMarkets(formatted);
                    } else {
                        setMarkets(mocks);
                    }
                } else {
                    setMarkets(mocks);
                }
            } catch (e) {
                console.error("Failed to load markets:", e);
                // Fallback to mocks on error so screen is never empty
                setMarkets([
                    { id: "m1", title: "¿Bitcoin superará los $150k en 2026?", category: "Cripto", yes: 65, vol: "128.5 Ξ", img: "https://picsum.photos/seed/btc/100" },
                    { id: "m2", title: "¿Argentina ganará el mundial 2026?", category: "Deportes", yes: 48, vol: "450.0 Ξ", img: "https://picsum.photos/seed/arg/100" },
                    { id: "m3", title: "¿Elon Musk llegará a Marte antes de 2027?", category: "Tech", yes: 12, vol: "89.1 Ξ", img: "https://picsum.photos/seed/mars/100" }
                ]);
            } finally {
                setLoading(false);
            }
        };
        loadMarkets();
    }, [contract]);

    const filtered = markets.filter(m => {
        const matchesTab = activeTab === 'Todo' || m.category === activeTab;
        const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const ExploreCard = ({ item }: any) => (
        <div
            onClick={() => navigate(`/market/${item.id}`, { state: { marketData: item } })}
            className="flex items-center gap-4 p-4 bg-[#15171b] border border-white/5 rounded-2xl active:bg-[#1a1d21] transition-all cursor-pointer mb-3 hover:border-white/10 group"
        >
            <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-slate-800 border border-white/10">
                <img src={item.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="market" />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-500 px-1.5 py-0.5 bg-blue-500/10 rounded">
                        {item.category}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold">• {item.vol}</span>
                </div>
                <h3 className="text-white text-sm font-bold leading-tight truncate mb-2">
                    {item.title}
                </h3>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        <span className="text-xs font-bold text-emerald-500">{item.yes}% SÍ</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                        <span className="text-xs font-bold text-red-500">{100 - item.yes}% NO</span>
                    </div>
                </div>
            </div>
            <span className="material-symbols-outlined text-slate-600 transition-colors">chevron_right</span>
        </div>
    );

    return (
        <div className="bg-[#0b0d10] min-h-screen flex flex-col pb-24">
            <header className="sticky top-0 z-40 bg-[#0b0d10]/95 backdrop-blur-xl border-b border-white/5 px-4 pt-4 pb-2">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white text-2xl font-black tracking-tight">Explorar</h2>
                </div>

                <div className="relative flex items-center w-full h-12 rounded-2xl bg-[#15171b] border border-white/10 focus-within:border-blue-500/50 transition-all">
                    <div className="absolute left-4 text-slate-500">
                        <span className="material-symbols-outlined text-[22px]">search</span>
                    </div>
                    <input
                        className="w-full h-full bg-transparent border-none text-white placeholder:text-slate-500 pl-11 pr-4 text-sm font-medium focus:ring-0 focus:outline-none"
                        placeholder="Equipos, políticos, crypto..."
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex gap-2.5 mt-4 overflow-x-auto no-scrollbar pb-2">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveTab(cat)}
                            className={`flex h-9 shrink-0 items-center justify-center rounded-xl px-5 border text-xs font-bold transition-all ${activeTab === cat ? 'bg-blue-600 text-white border-transparent' : 'bg-[#15171b] text-slate-400 border-white/5'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </header>

            <main className="flex-1 px-4 py-6">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-28 bg-[#15171b] rounded-2xl animate-pulse border border-white/5"></div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {filtered.length > 0 ? (
                            filtered.map((item) => <ExploreCard key={item.id} item={item} />)
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3 opacity-40">
                                <span className="material-symbols-outlined text-6xl">travel_explore</span>
                                <p className="text-sm font-bold">Sin resultados</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
            <BottomNav />
        </div>
    );
};

export default ExploreScreen;