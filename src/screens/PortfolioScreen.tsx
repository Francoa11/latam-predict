import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useToast } from '../context/ToastContext';
import { useBlockchain } from '../context/BlockchainContext';
import { ethers } from 'ethers';

const PortfolioScreen: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { contract, account } = useBlockchain();

    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
    const [balance, setBalance] = useState("0.0000");
    const [loading, setLoading] = useState(false);

    const [activeBets, setActiveBets] = useState<any[]>([]);
    const [historyBets, setHistoryBets] = useState<any[]>([]);

    useEffect(() => {
        const loadPortfolio = async () => {
            if (account) {
                try {
                    setLoading(true);

                    // 1. Fetch Balance (Sepolia)
                    const provider = new ethers.JsonRpcProvider('https://rpc.sepolia.org');
                    const bal = await provider.getBalance(account);
                    setBalance(Number(ethers.formatEther(bal)).toFixed(4));

                    // 2. Fetch User Bets from Blockchain
                    if (contract) {
                        const totalMarkets = await contract.nextMarketId();
                        const myBets = [];

                        // Solo buscamos los últimos 20 para performance
                        const start = Math.max(0, Number(totalMarkets) - 20);

                        for (let i = start; i < Number(totalMarkets); i++) {
                            const market = await contract.markets(i);
                            const yesShares = await contract.yesShares(i, account);
                            const noShares = await contract.noShares(i, account);

                            if (ethers.formatEther(yesShares) !== "0.0" || ethers.formatEther(noShares) !== "0.0") {
                                const side = ethers.formatEther(yesShares) !== "0.0" ? "SÍ" : "NO";
                                const amt = ethers.formatEther(yesShares) !== "0.0" ? yesShares : noShares;

                                myBets.push({
                                    id: i,
                                    title: market.question,
                                    outcome: side,
                                    amount: Number(ethers.formatEther(amt)).toFixed(4),
                                    currentVal: Number(ethers.formatEther(amt)), // Simplificado
                                    isLive: !market.resolved
                                });
                            }
                        }

                        const active = myBets.filter(b => b.isLive);
                        const history = myBets.filter(b => !b.isLive);

                        setActiveBets(active);
                        setHistoryBets(history);
                    }
                } catch (e) {
                    console.error("Error loading portfolio:", e);
                } finally {
                    setLoading(false);
                }
            }
        };

        loadPortfolio();
    }, [account, contract]);

    const handleClosePosition = (e: React.MouseEvent) => {
        e.stopPropagation();
        showToast("Las posiciones se liquidan automáticamente al resolver el mercado");
    };

    const EmptyState = ({ message, sub, icon }: { message: string, sub: string, icon: string }) => (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in px-8">
            <div className="w-20 h-20 bg-[#1a1d21] rounded-full flex items-center justify-center mb-6 border border-white/5 shadow-inner">
                <span className="material-symbols-outlined text-4xl text-slate-600">{icon}</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{message}</h3>
            <p className="text-sm text-slate-400 leading-relaxed max-w-[240px] mb-8">{sub}</p>
            <button
                onClick={() => navigate('/home')}
                className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors shadow-lg active:scale-[0.98]"
            >
                Explorar Mercados
            </button>
        </div>
    );

    return (
        <div className="flex h-full min-h-screen w-full flex-col bg-[#0b0d10] text-white pb-24">
            <header className="sticky top-0 z-20 flex items-center bg-[#0b0d10]/95 backdrop-blur-md px-4 py-3 border-b border-white/5 w-full">
                <h2 className="text-lg font-bold flex-1 text-center">Mi Cartera</h2>
            </header>

            <div className="p-4 flex-1">
                {/* Balance Summary - Card Style */}
                <div className="bg-gradient-to-br from-[#1c2026] to-[#15171b] rounded-2xl p-6 border border-white/10 mb-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 p-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                        <span className="material-symbols-outlined text-[140px]">account_balance_wallet</span>
                    </div>
                    <div className="relative z-10 flex flex-col items-center py-4">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Saldo Total (Sepolia)</span>
                        <h2 className="text-4xl font-black text-white tracking-tight flex items-center gap-2">
                            <span className="text-2xl text-blue-500">Ξ</span>
                            {loading ? "..." : balance}
                        </h2>
                        <div className="mt-6 flex gap-3 w-full">
                            <button onClick={() => navigate('/deposit')} className="flex-1 bg-white/5 border border-white/10 py-2.5 rounded-xl text-xs font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-sm">add</span> Depositar
                            </button>
                            <button onClick={() => navigate('/withdraw')} className="flex-1 bg-white/5 border border-white/10 py-2.5 rounded-xl text-xs font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-sm">arrow_upward</span> Retirar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-[#15171b] rounded-xl border border-white/5 mb-6">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'active' ? 'bg-[#2a2e36] text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Predicciones ({activeBets.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'history' ? 'bg-[#2a2e36] text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Historial ({historyBets.length})
                    </button>
                </div>

                {/* List Content */}
                <div className="flex flex-col gap-3 min-h-[200px]">
                    {activeTab === 'active' ? (
                        activeBets.length > 0 ? (
                            activeBets.map((bet) => (
                                <div key={bet.id} onClick={() => navigate(`/market/${bet.id}`)} className="flex flex-col gap-3 rounded-xl bg-[#15171b] p-4 shadow-sm border border-white/5 cursor-pointer active:bg-[#1a1d21] transition-all hover:border-white/10 group">
                                    <div className="flex justify-between items-start gap-3">
                                        <p className="text-[15px] font-semibold leading-snug line-clamp-2 flex-1 text-slate-200 group-hover:text-white transition-colors">
                                            {bet.title}
                                        </p>
                                        <span className="text-[9px] font-bold text-white bg-blue-600 px-1.5 py-0.5 rounded uppercase shrink-0">Activo</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/5 mt-1">
                                        <div>
                                            <span className="text-[9px] text-slate-500 block uppercase font-bold mb-1">Tu Posición</span>
                                            <div className="flex items-center gap-1.5">
                                                <span className={`font-bold text-xs px-1.5 py-0.5 rounded border ${bet.outcome === 'SÍ' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : 'text-red-500 bg-red-500/10 border-red-500/20'}`}>{bet.outcome}</span>
                                                <span className="text-xs font-medium text-slate-300">{bet.amount} Ξ</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[9px] text-slate-500 block uppercase font-bold mb-1">Monto Apostado</span>
                                            <span className="text-sm font-bold text-white">{bet.amount} ETH</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <EmptyState
                                message="Sin predicciones activas"
                                sub="Tus apuestas en el mercado real aparecerán aquí."
                                icon="rocket_launch"
                            />
                        )
                    ) : (
                        historyBets.length > 0 ? (
                            historyBets.map((bet) => (
                                <div key={bet.id} className="flex flex-col gap-3 rounded-xl bg-[#15171b]/50 p-4 border border-white/5 opacity-80">
                                    <p className="text-[15px] font-semibold text-slate-400">{bet.title}</p>
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-xs text-slate-500">Resultado: Pendiente</span>
                                        <span className="text-xs font-bold text-slate-300">{bet.amount} ETH</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <EmptyState
                                message="Historial vacío"
                                sub="Tus predicciones finalizadas aparecerán aquí."
                                icon="history"
                            />
                        )
                    )}
                </div>
            </div>
            <BottomNav />
        </div>
    );
};

export default PortfolioScreen;