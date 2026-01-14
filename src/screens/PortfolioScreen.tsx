import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useToast } from '../context/ToastContext';
import { useBlockchain } from '../context/BlockchainContext';
import { ethers } from 'ethers';

const PortfolioScreen: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { contract, account, getERC20Contract, USDT_ADDRESS, USDC_ADDRESS } = useBlockchain();

    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
    const [totalBal, setTotalBal] = useState("0.00");
    const [loading, setLoading] = useState(false);

    const [activeBets, setActiveBets] = useState<any[]>([]);
    const [historyBets, setHistoryBets] = useState<any[]>([]);

    useEffect(() => {
        const loadPortfolio = async () => {
            if (account) {
                try {
                    setLoading(true);
                    const provider = new ethers.JsonRpcProvider('https://polygon-rpc.com');

                    // 1. Fetch Balances
                    const usdtContract = getERC20Contract(USDT_ADDRESS, provider);
                    const usdcContract = getERC20Contract(USDC_ADDRESS, provider);

                    const [uBal, cBal] = await Promise.all([
                        usdtContract.balanceOf(account),
                        usdcContract.balanceOf(account)
                    ]);

                    const total = Number(ethers.formatUnits(uBal, 6)) + Number(ethers.formatUnits(cBal, 6));
                    setTotalBal(total.toFixed(2));

                    // 2. Fetch User Bets
                    if (contract) {
                        const totalMarketsBN = await contract.nextMarketId();
                        const totalMarkets = Number(totalMarketsBN);
                        const myBets = [];

                        // Optimización: Solo buscamos los últimos 50
                        const start = Math.max(0, totalMarkets - 50);

                        for (let i = start; i < totalMarkets; i++) {
                            const [market, yesSharesBN, noSharesBN] = await Promise.all([
                                contract.markets(i),
                                contract.userYesShares(i, account),
                                contract.userNoShares(i, account)
                            ]);

                            const yesShares = Number(ethers.formatUnits(yesSharesBN, 6));
                            const noShares = Number(ethers.formatUnits(noSharesBN, 6));

                            if (yesShares > 0 || noShares > 0) {
                                myBets.push({
                                    id: i,
                                    title: market.question,
                                    outcome: yesShares > 0 ? "SÍ" : "NO",
                                    amount: (yesShares > 0 ? yesShares : noShares).toFixed(2),
                                    isLive: !market.resolved
                                });
                            }
                        }

                        setActiveBets(myBets.filter(b => b.isLive));
                        setHistoryBets(myBets.filter(b => !b.isLive));
                    }
                } catch (e) {
                    console.error("Error loading portfolio:", e);
                } finally {
                    setLoading(false);
                }
            }
        };

        loadPortfolio();
    }, [account, contract, getERC20Contract, USDT_ADDRESS, USDC_ADDRESS]);

    const EmptyState = ({ message, sub, icon }: { message: string, sub: string, icon: string }) => (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in px-8">
            <div className="w-24 h-24 bg-[#15171b] rounded-[40px] flex items-center justify-center mb-8 border border-white/5 shadow-inner">
                <span className="material-symbols-outlined text-5xl text-slate-700">{icon}</span>
            </div>
            <h3 className="text-xl font-black text-white mb-2">{message}</h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-[240px] font-bold mb-10">{sub}</p>
            <button
                onClick={() => navigate('/')}
                className="w-full h-14 bg-white text-black font-black text-sm tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all"
            >
                EXPLORAR MERCADOS
            </button>
        </div>
    );

    return (
        <div className="flex min-h-screen w-full flex-col bg-[#0b0d10] text-white pb-24">
            <header className="sticky top-0 z-40 bg-[#0b0d10]/95 backdrop-blur-xl border-b border-white/5 px-6 h-[65px] flex items-center justify-between w-full max-w-[480px] mx-auto">
                <h2 className="text-sm font-black uppercase tracking-[0.2em] w-full text-center">Mi Portafolio</h2>
            </header>

            <main className="flex-1 w-full max-w-[480px] mx-auto px-6 py-8">
                {/* Balance Summary */}
                <div className="bg-[#15171b] rounded-[36px] p-8 border border-white/5 mb-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute -right-8 -top-8 p-4 opacity-[0.03] rotate-12">
                        <span className="material-symbols-outlined text-[180px]">account_balance_wallet</span>
                    </div>
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Valor de la Cartera</span>
                        <h2 className="text-5xl font-black text-white tracking-tighter mb-8">
                            <span className="text-3xl text-blue-500 opacity-50 mr-1">$</span>
                            {loading ? "..." : totalBal}
                        </h2>
                        <div className="grid grid-cols-2 gap-4 w-full">
                            <button onClick={() => navigate('/deposit')} className="h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black tracking-widest transition-all flex items-center justify-center gap-2">
                                DEPOSITAR
                            </button>
                            <button onClick={() => navigate('/withdraw')} className="h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black tracking-widest transition-all flex items-center justify-center gap-2">
                                RETIRAR
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex p-1.5 bg-[#15171b] rounded-2xl border border-white/5 mb-8">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`flex-1 py-3 text-xs font-black rounded-xl transition-all tracking-widest ${activeTab === 'active' ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40' : 'text-slate-500'}`}
                    >
                        ACTIVAS ({activeBets.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 py-3 text-xs font-black rounded-xl transition-all tracking-widest ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40' : 'text-slate-500'}`}
                    >
                        HISTORIAL ({historyBets.length})
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    {loading ? (
                        [1, 2, 3].map(i => <div key={i} className="h-28 bg-[#15171b] rounded-3xl animate-pulse border border-white/5"></div>)
                    ) : (
                        activeTab === 'active' ? (
                            activeBets.length > 0 ? (
                                activeBets.map((bet) => (
                                    <div key={bet.id} onClick={() => navigate(`/market/${bet.id}`)} className="bg-[#15171b] rounded-3xl p-5 border border-white/5 active:scale-[0.98] transition-all cursor-pointer shadow-sm relative overflow-hidden group">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-sm font-black leading-tight text-white/90 group-hover:text-white transition-colors flex-1 pr-4">{bet.title}</h3>
                                            <span className={`text-[8px] font-black px-2 py-1 rounded border ${bet.outcome === 'SÍ' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : 'text-red-500 border-red-500/20 bg-red-500/5'}`}>{bet.outcome}</span>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Acciones</span>
                                                <span className="text-base font-black text-white">{bet.amount} POS</span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Inversión</span>
                                                <span className="text-base font-black text-white">${bet.amount}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <EmptyState message="Sin posiciones" sub="Tus predicciones reales aparecerán aquí cuando operes." icon="explore" />
                            )
                        ) : (
                            historyBets.map((bet) => (
                                <div key={bet.id} className="bg-[#15171b]/50 rounded-3xl p-5 border border-white/5 opacity-60 grayscale-[0.5]">
                                    <h3 className="text-sm font-black text-slate-400 mb-3">{bet.title}</h3>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-white/5 rounded">Resolviendo...</span>
                                        <span className="text-sm font-black">${bet.amount}</span>
                                    </div>
                                </div>
                            ))
                        )
                    )}
                </div>
            </main>
            <BottomNav />
        </div>
    );
};

export default PortfolioScreen;