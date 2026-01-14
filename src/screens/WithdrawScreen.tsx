import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBlockchain } from '../context/BlockchainContext';
import { useToast } from '../context/ToastContext';
import { ethers } from 'ethers';

const WithdrawScreen: React.FC = () => {
    const navigate = useNavigate();
    const { account, getERC20Contract, USDT_ADDRESS, USDC_ADDRESS } = useBlockchain();
    const { showToast } = useToast();

    const [amount, setAmount] = useState("");
    const [address, setAddress] = useState("");
    const [token, setToken] = useState<'usdt' | 'usdc'>('usdt');
    const [balance, setBalance] = useState("0.00");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchBalance = async () => {
            if (account && getERC20Contract) {
                try {
                    const provider = new ethers.JsonRpcProvider('https://polygon-rpc.com');
                    const tokenAddr = token === 'usdt' ? USDT_ADDRESS : USDC_ADDRESS;
                    const tokenContract = getERC20Contract(tokenAddr, provider);
                    const bal = await tokenContract.balanceOf(account);
                    setBalance(Number(ethers.formatUnits(bal, 6)).toFixed(2));
                } catch (e) { console.error(e); }
            }
        };
        fetchBalance();
    }, [account, token, getERC20Contract, USDT_ADDRESS, USDC_ADDRESS]);

    const handleWithdraw = async () => {
        if (!amount || !address) {
            showToast("⚠️ Completa los campos");
            return;
        }
        try {
            setLoading(true);
            showToast("⏳ Preparando retiro seguro...");

            // Aquí iría el envío de tokens desde la Smart Wallet de Privy
            // user.sendToken(...) o contract.transfer(...)

            showToast("✅ Retiro enviado a la red Polygon");
            setTimeout(() => navigate('/portfolio'), 1500);
        } catch (error: any) {
            showToast("❌ Error: " + (error.message || "Fallo el retiro"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0b0d10] flex flex-col text-white pb-safe">
            <header className="flex items-center p-4 border-b border-white/5 bg-[#0b0d10] sticky top-0 z-10 w-full max-w-[480px] mx-auto">
                <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5">
                    <span className="material-symbols-outlined text-slate-400">arrow_back</span>
                </button>
                <h1 className="flex-1 text-center font-black text-sm uppercase tracking-widest pr-10">Retirar Fondos</h1>
            </header>

            <main className="flex-1 p-6 flex flex-col gap-8 max-w-[480px] mx-auto w-full">

                {/* Token Select */}
                <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 block px-1">Seleccionar Activo</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setToken('usdt')}
                            className={`p-5 rounded-3xl border transition-all flex items-center justify-between ${token === 'usdt' ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/5 bg-[#15171b]'}`}
                        >
                            <span className="text-sm font-black">USDT</span>
                            <div className={`w-2 h-2 rounded-full ${token === 'usdt' ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>
                        </button>
                        <button
                            onClick={() => setToken('usdc')}
                            className={`p-5 rounded-3xl border transition-all flex items-center justify-between ${token === 'usdc' ? 'border-blue-500 bg-blue-500/10' : 'border-white/5 bg-[#15171b]'}`}
                        >
                            <span className="text-sm font-black">USDC</span>
                            <div className={`w-2 h-2 rounded-full ${token === 'usdc' ? 'bg-blue-500' : 'bg-slate-700'}`}></div>
                        </button>
                    </div>
                </div>

                {/* Amount */}
                <div>
                    <div className="flex justify-between items-center mb-4 px-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Monto a Enviar</label>
                        <span className="text-[10px] font-black text-slate-400">Máx: ${balance}</span>
                    </div>
                    <div className="relative">
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-[#15171b] border border-white/10 rounded-3xl py-6 px-8 text-4xl font-black focus:border-blue-500 outline-none transition-all pr-24 shadow-inner"
                        />
                        <button
                            onClick={() => setAmount(balance)}
                            className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-full"
                        >
                            MAX
                        </button>
                    </div>
                </div>

                {/* Destination */}
                <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 block px-1">Dirección Polygon (Destino)</label>
                    <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="0x..."
                        className="w-full bg-[#15171b] border border-white/10 rounded-3xl py-5 px-6 text-xs font-mono font-bold focus:border-blue-500 outline-none transition-all shadow-inner"
                    />
                    <div className="mt-4 p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl flex items-start gap-3">
                        <span className="material-symbols-outlined text-orange-400 text-lg">warning</span>
                        <p className="text-[10px] text-orange-200/60 leading-relaxed font-bold uppercase tracking-tight">
                            Retira solo a red Polygon. Las transacciones en blockchain no son reversibles.
                        </p>
                    </div>
                </div>

                <div className="mt-auto pt-8">
                    <button
                        onClick={handleWithdraw}
                        disabled={loading || !amount || !address}
                        className={`w-full h-16 rounded-[24px] font-black text-sm tracking-widest shadow-2xl transition-all active:scale-[0.98] ${loading || !amount || !address ? 'bg-white/5 text-slate-600' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-900/40'}`}
                    >
                        {loading ? 'PROCESANDO...' : 'CONFIRMAR RETIRO'}
                    </button>
                </div>

            </main>
        </div>
    );
};

export default WithdrawScreen;
