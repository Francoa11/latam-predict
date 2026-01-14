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
    const { contract } = useBlockchain();

    // Inicializamos con datos de navegación si existen (para carga instantánea y soporte de Mocks)
    const [marketData, setMarketData] = useState<any>(location.state?.marketData || null);
    const [loading, setLoading] = useState(!marketData);

    useEffect(() => {
        const fetchMarket = async () => {
            // Si es un Mock (ID empieza con 'mock'), no intentamos leer del contrato
            if (id?.startsWith('mock')) {
                setLoading(false);
                return;
            }

            if (!contract) {
                setLoading(false);
                return;
            }

            try {
                // Leemos datos frescos de la blockchain
                const markets = await contract.allMarkets();
                const found = markets.find((m: any) => Number(m.id) === Number(id));

                if (found) {
                    const yesVotes = Number(ethers.formatEther(found.yesVotes));
                    const noVotes = Number(ethers.formatEther(found.noVotes));
                    const total = yesVotes + noVotes;
                    const yesPct = total === 0 ? 50 : Math.round((yesVotes / total) * 100);

                    // Actualizamos con datos reales
                    setMarketData({
                        id: Number(found.id),
                        title: found.question,
                        category: "Blockchain Real",
                        yes: yesPct,
                        no: 100 - yesPct,
                        vol: total > 0 ? `Ξ${total.toFixed(4)}` : "$0",
                        resolved: found.resolved
                    });
                }
            } catch (error) {
                console.error("Error fetching market detail:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMarket();
    }, [contract, id]);

    const handleSellAttempt = () => {
        showToast("La venta anticipada estará disponible próximamente");
    };

    // Si sigue cargando y no hay datos, mostramos loader
    if (loading && !marketData) {
        return <div className="min-h-screen bg-[#0b0d10] flex items-center justify-center text-white">Cargando...</div>;
    }

    // Datos finales a mostrar
    const displayData = marketData || {
        title: "Mercado no encontrado",
        category: "---",
        yes: 50,
        no: 50,
        vol: "---"
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#0b0d10] pb-[200px] text-white relative">
            {/* Header */}
            <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-[#0b0d10]/95 backdrop-blur border-b border-white/5">
                <button onClick={() => navigate('/home')} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors active:scale-90">
                    <span className="material-symbols-outlined text-white text-[20px]">arrow_back</span>
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {id?.startsWith('mock') ? 'Demo' : `Mercado #${id}`}
                    </span>
                </div>
                <button className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors active:scale-90">
                    <span className="material-symbols-outlined text-white text-[18px]">ios_share</span>
                </button>
            </header>

            <main className="flex-1 flex flex-col gap-6 px-4 py-6">

                {/* Info Header */}
                <div className="flex gap-4">
                    <div className="h-16 w-16 shrink-0 rounded-xl bg-slate-800 border border-white/10 overflow-hidden relative">
                        {displayData.img ? (
                            <img src={displayData.img} className="w-full h-full object-cover" alt="market" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">🗳️</div>
                        )}
                    </div>
                    <div className="flex flex-col justify-center flex-1">
                        <div className="mb-1 flex">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${displayData.category === 'Blockchain Real' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-blue-400 bg-blue-400/10 border-blue-400/20'}`}>
                                {displayData.category}
                            </span>
                        </div>
                        <h1 className="text-[18px] leading-snug font-bold text-white tracking-tight">
                            {displayData.title}
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400 border-b border-white/5 pb-4">
                    <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">calendar_today</span> ID: {id}
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">bar_chart</span> Vol: {displayData.vol}
                    </span>
                </div>

                {/* Probability Hero */}
                <div className="p-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-2">Probabilidad Actual</span>
                    <div className="flex justify-between items-end mb-3">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-500 mb-1 uppercase">SÍ</span>
                            <span className="text-5xl font-black text-emerald-500 tracking-tighter">{displayData.yes}%</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-bold text-slate-500 mb-1 uppercase">NO</span>
                            <span className="text-3xl font-bold text-red-500 tracking-tighter">{displayData.no}%</span>
                        </div>
                    </div>

                    {/* Bar */}
                    <div className="h-4 w-full rounded-full bg-white/5 overflow-hidden flex">
                        <div className="h-full bg-emerald-500 relative shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-500" style={{ width: `${displayData.yes}%` }}></div>
                    </div>
                </div>

                {/* Rules */}
                <div className="bg-[#15171b] rounded-xl p-4 border border-white/5">
                    <h3 className="font-bold text-xs text-white mb-2 uppercase tracking-wide">Reglas del Mercado</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Este mercado se resolverá basado en la ocurrencia del evento antes de la fecha límite especificada. {id?.startsWith('mock') ? "Este es un mercado de demostración generado por IA Gemini." : "Gobernado por contrato inteligente en Sepolia."}
                    </p>
                </div>
            </main>

            {/* Sticky Footer CTA */}
            <div className="fixed bottom-0 w-full max-w-[480px] z-50 pointer-events-none left-1/2 -translate-x-1/2">
                <div className="w-full bg-[#0b0d10] border-t border-white/10 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] pointer-events-auto bg-opacity-95 backdrop-blur-md">
                    <div className="flex flex-col gap-2">
                        {/* BUY BUTTONS */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate(`/participate/${id}`, { state: { side: 1 } })}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl h-12 shadow-lg shadow-emerald-900/40 flex items-center justify-between px-4 transition-transform active:scale-[0.98]"
                            >
                                <div className="flex flex-col items-start">
                                    <span className="font-bold text-base">SÍ</span>
                                    <span className="text-[9px] opacity-80 font-medium tracking-wide">COMPRAR</span>
                                </div>
                                <span className="text-lg font-bold">{displayData.yes}¢</span>
                            </button>
                            <button
                                onClick={() => navigate(`/participate/${id}`, { state: { side: 0 } })}
                                className="flex-1 bg-red-600 hover:bg-red-500 text-white rounded-xl h-12 shadow-lg shadow-red-900/40 flex items-center justify-between px-4 transition-transform active:scale-[0.98]"
                            >
                                <div className="flex flex-col items-start">
                                    <span className="font-bold text-base">NO</span>
                                    <span className="text-[9px] opacity-80 font-medium tracking-wide">COMPRAR</span>
                                </div>
                                <span className="text-lg font-bold">{displayData.no}¢</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketDetailScreen;