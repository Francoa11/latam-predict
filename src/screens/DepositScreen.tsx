import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBlockchain } from '../context/BlockchainContext';
import { useToast } from '../context/ToastContext';
import { ethers } from 'ethers';

const DepositScreen: React.FC = () => {
    const navigate = useNavigate();
    const { account, getERC20Contract, USDT_ADDRESS, USDC_ADDRESS } = useBlockchain();
    const { showToast } = useToast();

    const [usdtBal, setUsdtBal] = useState("0.00");
    const [usdcBal, setUsdcBal] = useState("0.00");
    const [maticBal, setMaticBal] = useState("0.00");
    const [loading, setLoading] = useState(false);

    // Fetch Balances on Polygon Mainnet
    useEffect(() => {
        const fetchBalances = async () => {
            if (account) {
                try {
                    setLoading(true);
                    const provider = new ethers.JsonRpcProvider('https://polygon-rpc.com');

                    // 1. Native MATIC balance
                    const mBal = await provider.getBalance(account);
                    setMaticBal(Number(ethers.formatEther(mBal)).toFixed(2));

                    // 2. USDT Balance (6 decimals)
                    const usdtContract = getERC20Contract(USDT_ADDRESS, provider);
                    const uBalance = await usdtContract.balanceOf(account);
                    setUsdtBal(Number(ethers.formatUnits(uBalance, 6)).toFixed(2));

                    // 3. USDC Balance (6 decimals)
                    const usdcContract = getERC20Contract(USDC_ADDRESS, provider);
                    const cBalance = await usdcContract.balanceOf(account);
                    setUsdcBal(Number(ethers.formatUnits(cBalance, 6)).toFixed(2));

                } catch (error) {
                    console.error("Error fetching balances:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchBalances();
        const interval = setInterval(fetchBalances, 15000);
        return () => clearInterval(interval);
    }, [account, getERC20Contract, USDT_ADDRESS, USDC_ADDRESS]);

    const handleCopy = () => {
        if (account) {
            navigator.clipboard.writeText(account);
            showToast("✅ Dirección copiada");
        }
    };

    return (
        <div className="min-h-screen bg-[#0b0d10] flex flex-col text-white">
            <header className="flex items-center p-4 border-b border-white/5 bg-[#0b0d10] sticky top-0 z-10 w-full max-w-[480px] mx-auto">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/5 transition-colors">
                    <span className="material-symbols-outlined text-slate-400">arrow_back</span>
                </button>
                <h1 className="flex-1 text-center font-bold text-lg pr-8">Depositar Fondos</h1>
            </header>

            <main className="flex-1 p-6 flex flex-col items-center w-full max-w-[480px] mx-auto">

                <div className="w-full text-center mb-8">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border border-white/5 bg-white/5">
                        Red Polygon Mainnet
                    </span>
                </div>

                {/* Balances Card */}
                <div className="w-full bg-[#15171b] border border-white/5 rounded-3xl p-6 mb-8 shadow-xl">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                                    <span className="material-symbols-outlined text-[20px]">attach_money</span>
                                </div>
                                <span className="font-bold text-slate-300">USDT</span>
                            </div>
                            <span className="text-xl font-black">{loading ? "..." : `$${usdtBal}`}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                                    <span className="material-symbols-outlined text-[20px]">monetization_on</span>
                                </div>
                                <span className="font-bold text-slate-300">USDC</span>
                            </div>
                            <span className="text-xl font-black">{loading ? "..." : `$${usdcBal}`}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500">
                                    <span className="material-symbols-outlined text-[18px]">token</span>
                                </div>
                                <span className="font-bold text-slate-500">POL (Gas)</span>
                            </div>
                            <span className="text-sm font-bold text-slate-400">{loading ? "..." : `${maticBal} POL`}</span>
                        </div>
                    </div>
                </div>

                {/* QR Section */}
                <div className="w-full bg-[#1a1d21] rounded-[32px] p-8 border border-white/5 shadow-2xl flex flex-col items-center mb-8 relative overflow-hidden">
                    <div className="absolute top-[-20%] left-[-20%] w-[150px] h-[150px] bg-blue-600/10 rounded-full blur-[60px] pointer-events-none"></div>

                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 px-1 text-center">
                        Envía tokens (USDT/USDC/POL) a esta dirección en la red Polygon
                    </span>

                    <div className="w-48 h-48 bg-white rounded-3xl mb-8 p-3 shadow-2xl z-10">
                        <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${account}`}
                            alt="Wallet QR"
                            className="w-full h-full object-contain"
                        />
                    </div>

                    <div
                        className="w-full bg-[#0b0d10] rounded-2xl p-4 flex items-center justify-between gap-3 border border-white/10 group cursor-pointer active:scale-[0.98] transition-all z-10"
                        onClick={handleCopy}
                    >
                        <code className="text-[11px] text-slate-300 font-mono truncate flex-1 font-bold">
                            {account || "Cargando..."}
                        </code>
                        <span className="material-symbols-outlined text-slate-500 text-lg group-hover:text-blue-400 transition-colors">content_copy</span>
                    </div>
                </div>

                <div className="bg-blue-600/5 border border-blue-500/10 p-5 rounded-2xl flex items-start gap-4 w-full">
                    <span className="material-symbols-outlined text-blue-400 text-[20px] shrink-0">info</span>
                    <div className="flex flex-col gap-1">
                        <p className="text-[11px] text-blue-200/60 font-medium leading-relaxed uppercase tracking-wider">Tip profesional</p>
                        <p className="text-xs text-white/80 leading-relaxed font-bold">
                            Necesitas una pequeña cantidad de <span className="text-purple-400">POL (antes MATIC)</span> para pagar el gas de tus transacciones.
                        </p>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default DepositScreen;
