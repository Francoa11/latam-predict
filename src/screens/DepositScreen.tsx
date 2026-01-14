import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBlockchain } from '../context/BlockchainContext';
import { useToast } from '../context/ToastContext';
import { ethers } from 'ethers';

const DepositScreen: React.FC = () => {
    const navigate = useNavigate();
    const { contract, account } = useBlockchain();
    const { showToast } = useToast();

    const [sepoliaBal, setSepoliaBal] = useState("0.0000");
    const [polygonBal, setPolygonBal] = useState("0.0000");
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'sepolia' | 'polygon'>('sepolia');

    // Fetch Balances Multi-Chain
    useEffect(() => {
        const fetchBalances = async () => {
            if (account) {
                try {
                    setLoading(true);

                    // 1. Sepolia Balance (Direct RPC to avoid network switch issues)
                    const sepProvider = new ethers.JsonRpcProvider('https://rpc.sepolia.org');
                    const sepBal = await sepProvider.getBalance(account);
                    setSepoliaBal(Number(ethers.formatEther(sepBal)).toFixed(4));

                    // 2. Polygon Amoy Balance
                    const polProvider = new ethers.JsonRpcProvider('https://rpc-amoy.polygon.technology');
                    const polBal = await polProvider.getBalance(account);
                    setPolygonBal(Number(ethers.formatEther(polBal)).toFixed(4));

                } catch (error) {
                    console.error("Error fetching balances:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchBalances();
        const interval = setInterval(fetchBalances, 10000);
        return () => clearInterval(interval);
    }, [account]);

    const handleCopy = () => {
        if (account) {
            navigator.clipboard.writeText(account);
            showToast("✅ Dirección copiada al portapapeles");
        }
    };

    return (
        <div className="min-h-screen bg-[#0b0d10] flex flex-col text-white">
            <header className="flex items-center p-4 border-b border-white/5 bg-[#0b0d10] sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/5 transition-colors">
                    <span className="material-symbols-outlined text-slate-400">arrow_back</span>
                </button>
                <h1 className="flex-1 text-center font-bold text-lg pr-8">Depositar Fondos</h1>
            </header>

            <main className="flex-1 p-6 flex flex-col items-center">

                {/* Network Switcher */}
                <div className="flex bg-[#15171b] p-1 rounded-xl mb-6 border border-white/5 w-full max-w-[320px]">
                    <button
                        onClick={() => setActiveTab('sepolia')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'sepolia' ? 'bg-[#25282e] text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span> Sepolia (ETH)
                    </button>
                    <button
                        onClick={() => setActiveTab('polygon')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'polygon' ? 'bg-[#25282e] text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span> Polygon (MAT)
                    </button>
                </div>

                {/* Balance Display */}
                <div className="w-full max-w-[320px] mb-8 text-center">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest px-3 py-1 rounded-full border border-white/5">
                        Saldo en {activeTab === 'sepolia' ? 'Ethereum Sepolia' : 'Polygon Amoy'}
                    </span>
                    <div className="mt-4 flex flex-col items-center animate-fade-in" key={activeTab}>
                        <h2 className="text-4xl font-black text-white tracking-tight flex items-center gap-2">
                            <span className={`text-2xl ${activeTab === 'sepolia' ? 'text-blue-500' : 'text-purple-500'}`}>
                                {activeTab === 'sepolia' ? 'Ξ' : '⬡'}
                            </span>
                            {loading ? <span className="animate-pulse opacity-50">...</span> : (activeTab === 'sepolia' ? sepoliaBal : polygonBal)}
                        </h2>
                        <span className="text-sm text-slate-500 font-medium mt-1">
                            {activeTab === 'sepolia' ? 'ETH' : 'MATIC / POL'}
                        </span>
                    </div>
                </div>

                <div className="w-full max-w-[320px] bg-[#15171b] rounded-2xl p-6 border border-white/5 shadow-2xl flex flex-col items-center mb-8 relative overflow-hidden">
                    {/* Glow effect dynamic color */}
                    <div className={`absolute top-[-50%] left-[20%] w-[200px] h-[200px] blur-[80px] pointer-events-none transition-colors duration-500 ${activeTab === 'sepolia' ? 'bg-blue-600/10' : 'bg-purple-600/10'}`}></div>

                    <span className="text-sm font-bold text-slate-400 mb-4">Tu Dirección {activeTab === 'polygon' ? '(Soporta USDT/USDC)' : ''}</span>

                    {/* QR Placeholder */}
                    <div className="w-48 h-48 bg-white rounded-xl mb-6 p-2 shadow-inner z-10 transition-transform hover:scale-[1.02]">
                        <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${account}`}
                            alt="Wallet QR"
                            className="w-full h-full object-contain"
                        />
                    </div>

                    <div className="w-full bg-[#0b0d10] rounded-xl p-3 flex items-center justify-between gap-2 border border-white/10 mb-4 group cursor-pointer z-10 active:scale-95 transition-transform" onClick={handleCopy}>
                        <code className="text-xs text-slate-300 font-mono truncate flex-1 block">
                            {account || "Cargando..."}
                        </code>
                        <span className="material-symbols-outlined text-slate-500 text-sm group-hover:text-white transition-colors">content_copy</span>
                    </div>
                </div>

                <div className="w-full max-w-[320px] space-y-3">
                    {activeTab === 'sepolia' ? (
                        <div className="bg-blue-600/10 border border-blue-500/20 p-4 rounded-xl flex items-start gap-3 animate-fade-in">
                            <span className="material-symbols-outlined text-blue-400 mt-0.5 text-[20px]">info</span>
                            <div>
                                <h3 className="font-bold text-blue-400 text-sm mb-1">Red Sepolia (Testnet)</h3>
                                <p className="text-xs text-blue-200/70 leading-relaxed">
                                    Usa esta red para interactuar con los mercados y probar la plataforma sin riesgo.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-purple-600/10 border border-purple-500/20 p-4 rounded-xl flex items-start gap-3 animate-fade-in">
                            <span className="material-symbols-outlined text-purple-400 mt-0.5 text-[20px]">currency_exchange</span>
                            <div>
                                <h3 className="font-bold text-purple-400 text-sm mb-1">Red Polygon (Amoy)</h3>
                                <p className="text-xs text-purple-200/70 leading-relaxed">
                                    Aquí puedes recibir <strong>MATIC, USDT y USDC</strong>. Tus activos aparecerán reflejados en tu balance total pronto.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
};

export default DepositScreen;
