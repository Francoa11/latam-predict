import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useBlockchain } from '../context/BlockchainContext';
import { ethers } from 'ethers';

const MarketDetailScreen: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useToast();
    const { contract, account } = useBlockchain();

    const [marketData, setMarketData] = useState<any>(location.state?.marketData || null);
    const [loading, setLoading] = useState(!marketData);
    const [userPosition, setUserPosition] = useState<{ side: 'SÍ' | 'NO' | null, shares: number }>({ side: null, shares: 0 });

    useEffect(() => {
        const fetchMarketAndPosition = async () => {
            if (!contract) return;

            try {
                // Fetch Market Data if not already present or to refresh
                if (!id?.startsWith('mock')) {
                    const markets = await contract.allMarkets();
                    const found = markets.find((m: any) => Number(m.id) === Number(id));
                    if (found) {
                        const yesVotes = Number(ethers.formatUnits(found.yesVotes, 6));
                        const noVotes = Number(ethers.formatUnits(found.noVotes, 6));
                        const total = yesVotes + noVotes;
                        const yesPct = total === 0 ? 50 : Math.round((yesVotes / total) * 100);
                        setMarketData({
                            id: Number(found.id),
                            title: found.question,
                            category: "Blockchain Real",
                            yes: yesPct,
                            no: 100 - yesPct,
                            vol: total > 0 ? total.toFixed(2) : "0",
                            resolved: found.resolved,
                            img: `https://picsum.photos/seed/${Number(found.id) + 50}/200`
                        });

                        // Fetch User Position
                        if (account) {
                            const [yesSharesBN, noSharesBN] = await Promise.all([
                                contract.userYesShares(id, account),
                                contract.userNoShares(id, account)
                            ]);

                            const yesShares = Number(ethers.formatUnits(yesSharesBN, 6));
                            const noShares = Number(ethers.formatUnits(noSharesBN, 6));

                            if (yesShares > 0) setUserPosition({ side: 'SÍ', shares: yesShares });
                            else if (noShares > 0) setUserPosition({ side: 'NO', shares: noShares });
                        }
                    }
                } else {
                    // Mock position for mock markets if user wants to play
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error fetching market detail:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMarketAndPosition();
    }, [contract, id, account]);

    const handleSell = () => {
        showToast("La función de venta anticipada estará disponible pronto.");
    };

    if (loading && !marketData) {
        return (
            <div className="min-h-screen bg-[#0b0d10] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const displayData = marketData || {
        title: "Mercado no encontrado",
        category: "---",
        yes: 50,
        no: 50,
        vol: "0"
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#0b0d10] pb-[160px] text-white">
            <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-[#0b0d10]/95 backdrop-blur border-b border-white/5 w-full max-w-[480px] mx-auto">
                <button onClick={() => navigate('/')} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 active:scale-90 transition-all">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">Detalle del Mercado</span>
                <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 active:scale-90 transition-all">
                    <span className="material-symbols-outlined text-[20px]">share</span>
                </button>
            </header>

            <main className="flex-1 flex flex-col gap-6 px-4 py-8 w-full max-w-[480px] mx-auto">
                <div className="flex gap-4">
                    <div className="h-20 w-20 shrink-0 rounded-[24px] bg-slate-800 border border-white/10 overflow-hidden shadow-2xl">
                        <img src={displayData.img || "https://picsum.photos/seed/market/200"} className="w-full h-full object-cover" alt="market" />
                    </div>
                    <div className="flex flex-col justify-center flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest px-2 py-0.5 bg-blue-500/10 rounded">{displayData.category}</span>
                            <span className="text-[10px] font-bold text-slate-500">• ID {id}</span>
                        </div>
                        <h1 className="text-[20px] leading-tight font-black text-white tracking-tight">{displayData.title}</h1>
                    </div>
                </div>

                {/* User Position Section */}
                {userPosition.side && (
                    <div className="bg-blue-600/5 border border-blue-500/20 rounded-3xl p-5 flex flex-col gap-4 animate-fade-in relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <span className="material-symbols-outlined text-[60px]">account_balance_wallet</span>
                        </div>
                        <div className="flex justify-between items-center relative z-10">
                            <div>
                                <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">Tu Posición</h3>
                                <p className="text-lg font-black text-white">{userPosition.shares.toFixed(2)} Acciones de <span className={userPosition.side === 'SÍ' ? 'text-emerald-400' : 'text-red-400'}>{userPosition.side}</span></p>
                            </div>
                            <button
                                onClick={handleSell}
                                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black tracking-widest transition-all active:scale-95"
                            >
                                VENDER
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#15171b] p-5 rounded-2xl border border-white/5">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Liquidez</span>
                        <span className="text-lg font-black text-white">${displayData.vol}</span>
                    </div>
                    <div className="bg-[#15171b] p-5 rounded-2xl border border-white/5 text-right">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Estatus</span>
                        <span className="text-sm font-black text-emerald-500 uppercase tracking-widest">Activo</span>
                    </div>
                </div>

                <div className="bg-[#15171b] p-8 rounded-[40px] border border-white/5 relative overflow-hidden">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-8 px-1">Probabilidad de Mercado</span>
                    <div className="flex justify-between items-end mb-6">
                        <div className="flex flex-col">
                            <span className="text-4xl font-black text-emerald-400 tracking-tighter">{displayData.yes}%</span>
                            <span className="text-[10px] font-black text-slate-500 uppercase mt-1">SÍ sucederá</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-3xl font-black text-red-500 tracking-tighter opacity-80">{displayData.no}%</span>
                            <span className="text-[10px] font-black text-slate-500 uppercase mt-1">NO sucederá</span>
                        </div>
                    </div>
                    <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                        <div className="h-full bg-emerald-500 transition-all duration-1000 shadow-[0_0_15px_rgba(16,185,129,0.3)]" style={{ width: `${displayData.yes}%` }}></div>
                    </div>
                </div>

                <div className="bg-white/5 p-6 rounded-[24px] border border-white/5">
                    <h3 className="font-black text-[10px] text-slate-500 mb-3 uppercase tracking-widest">Sobre la resolución</h3>
                    <p className="text-xs font-medium text-slate-400 leading-relaxed">
                        Este mercado se resolverá basado en datos oficiales verificados. Si compraste acciones de la opción ganadora, recibirás $1 por cada acción al momento del cierre.
                    </p>
                </div>
            </main>

            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] p-4 z-50">
                <div className="bg-[#1a1d21]/95 backdrop-blur-2xl border border-white/10 rounded-[36px] p-5 flex gap-4 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
                    <button
                        onClick={() => navigate(`/participate/${id}`, { state: { side: 1 } })}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 h-16 rounded-[24px] flex flex-col items-center justify-center transition-all active:scale-[0.97] shadow-lg shadow-emerald-900/40 relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <span className="text-[10px] font-black text-emerald-200 tracking-widest relative z-10 mb-0.5">COMPRAR</span>
                        <span className="text-xl font-black text-white relative z-10">SÍ ({displayData.yes}¢)</span>
                    </button>
                    <button
                        onClick={() => navigate(`/participate/${id}`, { state: { side: 0 } })}
                        className="flex-1 bg-red-600 hover:bg-red-500 h-16 rounded-[24px] flex flex-col items-center justify-center transition-all active:scale-[0.97] shadow-lg shadow-red-900/40 relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <span className="text-[10px] font-black text-red-200 tracking-widest relative z-10 mb-0.5">COMPRAR</span>
                        <span className="text-xl font-black text-white relative z-10">NO ({displayData.no}¢)</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MarketDetailScreen;