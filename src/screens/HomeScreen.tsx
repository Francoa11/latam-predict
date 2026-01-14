import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useBlockchain } from '../context/BlockchainContext';
import { useUser } from '../context/UserContext';
import { ethers } from 'ethers';

const HomeScreen: React.FC = () => {
    const navigate = useNavigate();
    const { username } = useUser();
    const { contract, account } = useBlockchain();
    const [activeTab, setActiveTab] = useState('Todo');
    const [searchQuery, setSearchQuery] = useState(''); // Estado para búsqueda
    const [showTutorial, setShowTutorial] = useState(false);
    const [tutorialStep, setTutorialStep] = useState(0);

    // DATOS "GEMINI AI" 2026
    const MOCK_MARKETS = [
        {
            id: "mock_btc", title: "¿Bitcoin superará los $150k antes de mediados de 2026?", category: "Cripto",
            yes: 68, no: 32, vol: "Ξ 128.5", img: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=200&auto=format&fit=crop"
        },
        {
            id: "mock_wc", title: "¿Argentina llegará a semifinales en el Mundial 2026?", category: "Deportes",
            yes: 45, no: 55, vol: "Ξ 45.2", img: "https://images.unsplash.com/photo-1522770179533-24471fcdba45?q=80&w=200&auto=format&fit=crop"
        },
        {
            id: "mock_ai", title: "¿Se declarará la primer AGI oficial antes de finalizar 2026?", category: "Tech",
            yes: 22, no: 78, vol: "Ξ 89.1", img: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=200&auto=format&fit=crop"
        },
        {
            id: "mock_inflation", title: "¿La inflación promedio de Latam bajará a un dígito en 2026?", category: "Economía",
            yes: 15, no: 85, vol: "Ξ 12.4", img: "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?q=80&w=200&auto=format&fit=crop"
        },
        {
            id: "mock_spacex", title: "¿Starship completará su primer aterrizaje tripulado en Marte?", category: "Espacio",
            yes: 8, no: 92, vol: "Ξ 35.0", img: "https://images.unsplash.com/photo-1517976487492-5750f3195933?q=80&w=200&auto=format&fit=crop"
        },
    ];

    const [markets, setMarkets] = useState<any[]>(MOCK_MARKETS); // Inicializamos con Mock siempre

    useEffect(() => {
        const loadMarkets = async () => {
            if (!contract) return;

            try {
                const data = await contract.allMarkets();
                if (data.length > 0) {
                    const formatted = data.map((m: any, index: number) => {
                        const yesVotes = Number(ethers.formatEther(m.yesVotes));
                        const noVotes = Number(ethers.formatEther(m.noVotes));
                        const total = yesVotes + noVotes;
                        const yesPct = total === 0 ? 50 : Math.round((yesVotes / total) * 100);
                        return {
                            id: Number(m.id),
                            title: m.question,
                            category: "Blockchain Real",
                            yes: yesPct,
                            no: 100 - yesPct,
                            vol: total > 0 ? `Ξ${total.toFixed(3)}` : "Nuevo",
                            img: `https://picsum.photos/seed/${Number(m.id) + 50}/100`
                        };
                    });
                    // COMBINAMOS Real + Mocks para que no desaparezcan
                    setMarkets([...formatted, ...MOCK_MARKETS]);
                }
            } catch (err) {
                console.error("Error cargando mercados:", err);
            }
        };
        loadMarkets();
    }, [contract]);

    const FilterChip = ({ label, active }: any) => (
        <button
            onClick={() => setActiveTab(label)}
            className={`px-4 py-2 rounded-lg text-[13px] font-bold whitespace-nowrap transition-all ${active ? 'bg-slate-700 text-white shadow-sm' : 'bg-transparent text-slate-400 hover:text-slate-200'}`}
        >
            {label}
        </button>
    );

    const MarketCard = (props: any) => (
        <div
            onClick={() => navigate(`/market/${props.id}`, { state: { marketData: props } })}
            className="flex flex-col gap-4 p-4 bg-[#15171b] border border-white/5 rounded-xl active:bg-[#1a1d21] transition-colors cursor-pointer hover:border-white/10 shadow-sm relative overflow-hidden group"
        >
            <div className="flex justify-between items-start gap-3">
                <div className="flex gap-3 items-start flex-1">
                    <img src={props.img} className="w-12 h-12 rounded-lg object-cover bg-slate-800 shrink-0 border border-white/5" alt="market" />
                    <div className="flex flex-col gap-1">
                        <h3 className="text-[17px] font-bold text-white leading-[1.3] pr-2">{props.title}</h3>
                        <div className="flex items-center gap-2">
                            <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${props.category === 'Blockchain Real' ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-500 bg-white/5'}`}>{props.category}</span>
                            <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]">bar_chart</span>
                                {props.vol}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center shrink-0">
                    <div className="relative w-14 h-14 flex items-center justify-center">
                        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <path className="text-slate-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                            <path className="text-blue-500" strokeDasharray={`${props.yes}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                        </svg>
                        <span className="text-[13px] font-bold text-blue-400">{props.yes}%</span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase mt-1">Chance</span>
                </div>
            </div>
            <div className="flex items-center gap-3 mt-1">
                <button className="flex-1 flex items-center justify-center h-12 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg text-emerald-500 transition-colors">
                    <span className="text-sm font-bold">SÍ</span>
                </button>
                <button className="flex-1 flex items-center justify-center h-12 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-500 transition-colors">
                    <span className="text-sm font-bold">NO</span>
                </button>
            </div>
        </div>
    );

    const tutorialSteps = [
        { title: "1. Elige un Mercado", desc: "Compra acciones de 'SÍ' o 'NO'...", img: "https://images.unsplash.com/photo-1611974765270-ca12586343bb?q=80&w=600&auto=format&fit=crop" },
        { title: "2. Haz tu Predicción", desc: "Fondea tu cuenta con crypto...", img: "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?q=80&w=600&auto=format&fit=crop" },
        { title: "3. Gana (Profit) 🤑", desc: "Gana el 100% si aciertas...", img: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=600&auto=format&fit=crop" }
    ];
    const handleNextStep = (e: any) => { e.stopPropagation(); if (tutorialStep < 2) setTutorialStep(p => p + 1); else { setShowTutorial(false); setTutorialStep(0); } };

    // Lógica de filtrado con BUSCADOR
    const filteredMarkets = markets.filter(market => {
        const matchesTab = activeTab === 'Todo' || market.category === activeTab;
        const matchesSearch = market.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    return (
        <div className="flex flex-col min-h-screen bg-[#0b0d10] relative">
            <header className="sticky top-0 z-40 bg-[#0b0d10] border-b border-white/5 pb-2">
                <div className="flex items-center justify-between px-4 h-[60px]">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/50">
                            <span className="material-symbols-outlined text-white text-[18px]">show_chart</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">LatamPredict</span>
                    </div>
                    {!account ? (
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate('/login')} className="text-sm font-bold text-slate-300 hover:text-white transition-colors">Log In</button>
                            <button onClick={() => navigate('/login')} className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors shadow-lg shadow-blue-900/20">Sign Up</button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate('/notifications')} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors relative">
                                <span className="material-symbols-outlined text-slate-400 text-[22px]">notifications</span>
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#0b0d10]"></span>
                            </button>
                            <div className="flex items-center gap-2 bg-slate-800 rounded-full px-4 py-1.5 border border-white/10 shadow-sm transition-all hover:bg-slate-700 cursor-pointer" onClick={() => navigate('/profile')}>
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-sm font-bold text-white tracking-wide">{username}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-4 mb-3">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 material-symbols-outlined text-[20px]">search</span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar mercados..."
                            className="w-full bg-[#15171b] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-[14px] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                            <span className="material-symbols-outlined text-[20px]">tune</span>
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-4">
                    <FilterChip label="Todo" active={activeTab === 'Todo'} />
                    <FilterChip label="Cripto" active={activeTab === 'Cripto'} />
                    <FilterChip label="Deportes" active={activeTab === 'Deportes'} />
                    <FilterChip label="Tech" active={activeTab === 'Tech'} />
                    <FilterChip label="Economía" active={activeTab === 'Economía'} />
                    <FilterChip label="Espacio" active={activeTab === 'Espacio'} />
                </div>
            </header>

            <main className="flex-1 px-4 py-4 flex flex-col gap-3 pb-32">
                {markets.length === 0 ? (
                    [1, 2, 3].map(i => (<div key={i} className="h-40 bg-[#15171b] rounded-xl animate-pulse border border-white/5"></div>))
                ) : (
                    <>
                        {filteredMarkets.length > 0 ? (
                            filteredMarkets.map((market) => (
                                <MarketCard key={market.id} {...market} />
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2 opacity-50">
                                <span className="material-symbols-outlined text-4xl">search_off</span>
                                <p className="text-sm">No encontramos resultados para "{searchQuery}"</p>
                            </div>
                        )}
                    </>
                )}
            </main>

            <div className="fixed bottom-[80px] left-1/2 -translate-x-1/2 z-50 pointer-events-none w-full max-w-[480px] flex justify-center">
                <button
                    onClick={() => setShowTutorial(true)}
                    className="pointer-events-auto backdrop-blur-md bg-white/5 hover:bg-white/10 border border-white/10 text-blue-300 px-4 py-2 rounded-full flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-black/20"
                >
                    <span className="material-symbols-outlined text-[18px]">info</span>
                    <span className="text-[13px] font-bold tracking-wide">¿Cómo funciona?</span>
                </button>
            </div>

            {showTutorial && (
                <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in" onClick={() => setShowTutorial(false)}>
                    {/* ... Modal content same as before ... */}
                    <div className="w-full max-w-[360px] bg-[#1a1d21] rounded-2xl overflow-hidden shadow-2xl relative flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="absolute top-4 left-4 z-20">
                            <button onClick={() => setShowTutorial(false)} className="text-white/70 hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-[24px]">close</span>
                            </button>
                        </div>
                        <div className="w-full aspect-[4/3] bg-[#25282e] relative overflow-hidden flex items-center justify-center border-b border-white/5">
                            <img src={tutorialSteps[tutorialStep].img} className="w-full h-full object-cover" alt="Tutorial Step" />
                        </div>
                        <div className="p-6 flex flex-col items-center text-center">
                            <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                                {tutorialSteps[tutorialStep].title}
                            </h3>
                            <p className="text-[13px] text-slate-400 leading-relaxed mb-6">
                                {tutorialSteps[tutorialStep].desc}
                            </p>
                            <div className="flex gap-2 mb-6">
                                {tutorialSteps.map((_, i) => (
                                    <div key={i} className={`h-1.5 rounded-full transition-all ${i === tutorialStep ? 'w-6 bg-blue-500' : 'w-1.5 bg-slate-600'}`}></div>
                                ))}
                            </div>
                            <button onClick={handleNextStep} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98] text-sm">
                                {tutorialStep === tutorialSteps.length - 1 ? "Empezar" : "Siguiente"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <BottomNav />
        </div>
    );
};

export default HomeScreen;