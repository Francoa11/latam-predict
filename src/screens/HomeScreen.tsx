import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useBlockchain } from '../context/BlockchainContext';
import { useUser } from '../context/UserContext';
import { usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { useToast } from '../context/ToastContext';

const HomeScreen: React.FC = () => {
    const navigate = useNavigate();
    const { username } = useUser();
    const { login, authenticated, ready } = usePrivy();
    const { contract, account, getERC20Contract, USDT_ADDRESS, USDC_ADDRESS } = useBlockchain();
    const { showToast } = useToast();

    const [activeTab, setActiveTab] = useState('Todo');
    const [searchQuery, setSearchQuery] = useState('');
    const [showTutorial, setShowTutorial] = useState(false);
    const [tutorialStep, setTutorialStep] = useState(0);
    const [totalBalance, setTotalBalance] = useState("0.00");

    const MOCK_MARKETS = [
        {
            id: "mock_btc", title: "¿Bitcoin superará los $150k antes de mediados de 2026?", category: "Cripto",
            yes: 68, no: 32, vol: "125K", users: 1240, img: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=200&auto=format&fit=crop"
        },
        {
            id: "mock_wc", title: "¿Argentina llegará a semifinales en el Mundial 2026?", category: "Deportes",
            yes: 45, no: 55, vol: "450K", users: 890, img: "https://images.unsplash.com/photo-1522770179533-24471fcdba45?q=80&w=200&auto=format&fit=crop"
        },
        {
            id: "mock_ai", title: "¿Se declarará la primer AGI oficial antes de finalizar 2026?", category: "Tech",
            yes: 22, no: 78, vol: "89K", users: 560, img: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=200&auto=format&fit=crop"
        },
        {
            id: "mock_inflation", title: "¿La inflación promedio de Latam bajará a un dígito en 2026?", category: "Economía",
            yes: 15, no: 85, vol: "12K", users: 340, img: "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?q=80&w=200&auto=format&fit=crop"
        }
    ];

    const [markets, setMarkets] = useState<any[]>(MOCK_MARKETS);

    useEffect(() => {
        const loadData = async () => {
            if (!account) return;
            try {
                const provider = new ethers.JsonRpcProvider('https://polygon-rpc.com');
                const usdtContract = getERC20Contract(USDT_ADDRESS, provider);
                const usdcContract = getERC20Contract(USDC_ADDRESS, provider);

                const [uBal, cBal] = await Promise.all([
                    usdtContract.balanceOf(account),
                    usdcContract.balanceOf(account)
                ]);

                const total = Number(ethers.formatUnits(uBal, 6)) + Number(ethers.formatUnits(cBal, 6));
                setTotalBalance(total.toFixed(2));

                if (contract) {
                    const data = await contract.allMarkets();
                    if (data.length > 0) {
                        const formatted = data.map((m: any) => {
                            const yesVotes = Number(ethers.formatUnits(m.yesVotes, 6));
                            const noVotes = Number(ethers.formatUnits(m.noVotes, 6));
                            const totalV = yesVotes + noVotes;
                            const yesPct = totalV === 0 ? 50 : Math.round((yesVotes / totalV) * 100);
                            return {
                                id: Number(m.id),
                                title: m.question,
                                category: "Blockchain Real",
                                yes: yesPct,
                                no: 100 - yesPct,
                                vol: totalV > 0 ? (totalV > 1000 ? (totalV / 1000).toFixed(1) + "K" : totalV.toFixed(1)) : "Nuevo",
                                users: Math.floor(Math.random() * 500) + 50,
                                img: `https://picsum.photos/seed/${Number(m.id) + 50}/100`
                            };
                        });
                        setMarkets([...formatted, ...MOCK_MARKETS]);
                    }
                }
            } catch (err) {
                console.error("Error cargando datos:", err);
            }
        };
        loadData();
    }, [account, contract, getERC20Contract, USDT_ADDRESS, USDC_ADDRESS]);

    const handleLogin = () => {
        if (!ready) {
            showToast("Iniciando servicios de sesión...");
            return;
        }
        try {
            login();
        } catch (e) {
            console.error("Login trigger error:", e);
            showToast("Error al abrir sesión. Intenta de nuevo.");
        }
    };

    const FilterChip = ({ label, active }: any) => (
        <button
            onClick={() => setActiveTab(label)}
            className={`px-4 py-2 rounded-xl text-[13px] font-bold whitespace-nowrap transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'bg-[#15171b] text-slate-400 border border-white/5'}`}
        >
            {label}
        </button>
    );

    const MarketCard = (props: any) => (
        <div
            onClick={() => navigate(`/market/${props.id}`, { state: { marketData: props } })}
            className="flex flex-col gap-4 p-4 bg-[#15171b] border border-white/5 rounded-2xl active:bg-[#1a1d21] transition-all cursor-pointer hover:border-white/10 shadow-sm relative overflow-hidden group mb-4"
        >
            <div className="flex justify-between items-start gap-3">
                <div className="flex gap-3 items-start flex-1">
                    <img src={props.img} className="w-12 h-12 rounded-xl object-cover bg-slate-800 shrink-0 border border-white/10 shadow-lg shadow-black/20" alt="market" />
                    <div className="flex flex-col gap-1">
                        <h3 className="text-[16px] font-bold text-white leading-tight pr-2">{props.title}</h3>
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest ${props.category === 'Blockchain Real' ? 'text-blue-400 bg-blue-400/10' : 'text-slate-500 bg-white/5'}`}>{props.category}</span>
                            <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]">group</span>
                                {props.users}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center shrink-0">
                    <div className="relative w-14 h-14 flex items-center justify-center">
                        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <path className="text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                            <path className="text-blue-500" strokeDasharray={`${props.yes}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        <span className="text-[13px] font-black text-blue-400">{props.yes}%</span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-600 uppercase mt-1 tracking-widest">Chance</span>
                </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 px-1">
                <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">bar_chart</span>
                    ${props.vol} liquidez
                </span>
                <span className="text-blue-500/50">Predict & Win</span>
            </div>

            <div className="flex items-center gap-3 mt-1">
                <button className="flex-1 flex items-center justify-center h-12 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 rounded-xl text-emerald-500 transition-all active:scale-95">
                    <span className="text-sm font-black italic">SÍ</span>
                </button>
                <button className="flex-1 flex items-center justify-center h-12 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-xl text-red-500 transition-all active:scale-95">
                    <span className="text-sm font-black italic">NO</span>
                </button>
            </div>
        </div>
    );

    const tutorialSteps = [
        { title: "1. Elige un Mercado", desc: "Compra acciones de 'SÍ' o 'NO'...", img: "/tutorial_step_1_markets_1768352655001.png" },
        { title: "2. Haz tu Predicción", desc: "Fondea tu cuenta con USDT o USDC en Polygon...", img: "/tutorial_step_2_predict_1768352677557.png" },
        { title: "3. Gana (Profit) 🤑", desc: "Gana el pozo si aciertas...", img: "/tutorial_step_3_earn_1768352694257.png" }
    ];

    const handleNextStep = (e: any) => { e.stopPropagation(); if (tutorialStep < 2) setTutorialStep(p => p + 1); else { setShowTutorial(false); setTutorialStep(0); } };

    const filteredMarkets = markets.filter(market => {
        const matchesTab = activeTab === 'Todo' || market.category === activeTab;
        const matchesSearch = market.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    return (
        <div className="flex flex-col min-h-screen bg-[#0b0d10] pb-24">
            <header className="sticky top-0 z-40 bg-[#0b0d10]/95 backdrop-blur-xl border-b border-white/5 py-3">
                <div className="flex items-center justify-between px-4 h-[56px] mb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40 overflow-hidden">
                            <div className="flex items-end gap-[2px]">
                                <div className="w-1.5 h-3 bg-white/40 rounded-t-sm"></div>
                                <div className="w-1.5 h-5 bg-white rounded-t-sm"></div>
                                <div className="w-1.5 h-2.5 bg-white/60 rounded-t-sm"></div>
                            </div>
                        </div>
                        <span className="text-2xl font-black text-white tracking-tighter">LatamPredict</span>
                    </div>
                    {!authenticated ? (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleLogin}
                                disabled={!ready}
                                className="px-4 py-2.5 rounded-[12px] text-[12px] font-black text-slate-400 hover:text-white transition-all uppercase tracking-wider"
                            >
                                Iniciar Sesión
                            </button>
                            <button
                                onClick={handleLogin}
                                disabled={!ready}
                                className="bg-[#2563eb] px-5 py-2.5 rounded-[12px] text-[12px] font-black text-white active:scale-95 transition-all shadow-xl shadow-blue-900/40 uppercase tracking-wider border border-blue-400/20"
                            >
                                Registrarse
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col items-end">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Balance</span>
                                <span className="text-sm font-black text-white leading-none">${totalBalance}</span>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden cursor-pointer active:scale-95 transition-all" onClick={() => navigate('/profile')}>
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`} alt="profile" />
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-4 mb-4">
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 material-symbols-outlined text-[22px]">search</span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar predicciones..."
                            className="w-full bg-[#15171b] border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-[15px] text-white focus:outline-none focus:border-blue-500/50 transition-all shadow-inner"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-4">
                    <FilterChip label="Todo" active={activeTab === 'Todo'} />
                    <FilterChip label="Cripto" active={activeTab === 'Cripto'} />
                    <FilterChip label="Deportes" active={activeTab === 'Deportes'} />
                    <FilterChip label="Tech" active={activeTab === 'Tech'} />
                    <FilterChip label="Economía" active={activeTab === 'Economía'} />
                </div>
            </header>

            <main className="flex-1 px-4 py-6">
                {markets.length === 0 ? (
                    [1, 2, 3].map(i => (<div key={i} className="h-40 bg-[#15171b] rounded-2xl animate-pulse border border-white/5 mb-4"></div>))
                ) : (
                    <>
                        {filteredMarkets.length > 0 ? (
                            filteredMarkets.map((market) => (
                                <MarketCard key={market.id} {...market} />
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-600 gap-2 opacity-50">
                                <span className="material-symbols-outlined text-5xl">search_off</span>
                                <p className="text-sm font-bold">Sin resultados</p>
                            </div>
                        )}
                    </>
                )}
            </main>

            <div className="fixed bottom-[100px] right-6 z-50">
                <button onClick={() => setShowTutorial(true)} className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-blue-900/50 active:scale-95 transition-all">
                    <span className="material-symbols-outlined">help</span>
                </button>
            </div>

            <BottomNav />
        </div>
    );
};

export default HomeScreen;