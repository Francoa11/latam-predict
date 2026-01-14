import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useBlockchain } from '../context/BlockchainContext';
import { useToast } from '../context/ToastContext';
import { ethers } from 'ethers';

const ParticipationScreen: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation(); // { side: 0 | 1, marketData }
    const { contract, account } = useBlockchain();
    const { showToast } = useToast();
    const [step, setStep] = useState<'form' | 'success'>('form');

    const [side, setSide] = useState<number>(location.state?.side !== undefined ? location.state.side : 1);
    const [amount, setAmount] = useState<string>("0.001");
    const [balance, setBalance] = useState<bigint>(BigInt(0));
    const [loadingBalance, setLoadingBalance] = useState(false); // Para no mostrar 0.0000 instantaneamente

    // Fetch Balance
    useEffect(() => {
        const fetchBalance = async () => {
            if (contract && account) {
                try {
                    setLoadingBalance(true);
                    // Accedemos al provider a través del contrato (signer)
                    const provider = contract.runner?.provider;
                    if (provider) {
                        const bal = await provider.getBalance(account);
                        setBalance(bal);
                    }
                } catch (error) {
                    console.error("Error fetching balance:", error);
                } finally {
                    setLoadingBalance(false);
                }
            }
        };
        fetchBalance();
        // Interval para refrescar
        const interval = setInterval(fetchBalance, 10000);
        return () => clearInterval(interval);
    }, [contract, account]);

    // Check Sufficient Funds
    const getInsufficientFunds = () => {
        try {
            if (!amount) return false;
            const value = ethers.parseEther(amount);
            return balance < value;
        } catch {
            return false;
        }
    };

    const insufficientFunds = getInsufficientFunds();
    const displayBalance = loadingBalance ? "..." : Number(ethers.formatEther(balance)).toFixed(4);

    const handleConfirm = async () => {
        if (!contract) {
            showToast("⚠️ Conecta tu Billetera primero");
            return;
        }

        // Si no hay saldo, redirigir a depósito
        if (insufficientFunds) {
            navigate('/deposit');
            return;
        }

        if (!id) {
            showToast("⚠️ Error: ID de mercado no válido");
            return;
        }

        try {
            showToast("⏳ Confirmando transacción...");
            const tx = await contract.buyShares(id, side, {
                value: ethers.parseEther(amount || "0")
            });
            await tx.wait();
            showToast("✅ ¡Apuesta confirmada en blockchain!");
            setStep('success');
        } catch (error: any) {
            console.error(error);
            showToast("❌ Error: " + (error.reason || error.message || "Falló la transacción"));
        }
    };

    if (step === 'success') {
        return (
            <div className="bg-background-light dark:bg-background-dark font-display h-screen w-full flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-6xl text-success">check_circle</span>
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">¡Predicción Enviada!</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-[280px]">
                    Has comprado posiciones en el Mercado #{id} por {amount} ETH. Te notificaremos cuando el mercado cierre.
                </p>
                <div className="w-full max-w-[320px] flex flex-col gap-3">
                    <button onClick={() => navigate('/portfolio')} className="w-full h-12 bg-primary text-white rounded-xl font-bold text-base shadow-lg shadow-primary/25 active:scale-[0.98] transition-transform">
                        Ver en Cartera
                    </button>
                    <button onClick={() => navigate('/home')} className="w-full h-12 bg-transparent text-slate-500 font-bold text-base hover:text-slate-900 dark:hover:text-white transition-colors">
                        Volver al Inicio
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#0b0d10] font-display h-screen w-full flex flex-col relative text-white">
            <header className="flex items-center justify-between px-4 py-3 bg-[#0b0d10]/95 backdrop-blur-md border-b border-white/5 w-full max-w-[480px] mx-auto fixed top-0 left-1/2 -translate-x-1/2 z-50">
                <div className="flex flex-col">
                    <h2 className="text-lg font-bold text-white">Nueva Predicción</h2>
                    <span className="text-[10px] text-slate-500 font-mono">Mercado ID: {id}</span>
                </div>
                <button onClick={() => navigate(-1)} className="p-2 -mr-2 text-slate-400 hover:bg-white/5 rounded-full transition-colors">
                    <span className="material-symbols-outlined">close</span>
                </button>
            </header>

            <main className="flex-1 overflow-y-auto px-4 py-6 mt-14 pb-32">
                {/* 1. Pick Side */}
                <div className="mb-8">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">1. Elige tu posición</label>
                    <div className="flex bg-[#1c2633] p-1.5 rounded-2xl h-16 relative">
                        {/* SÍ Button */}
                        <div className="flex-1 relative z-10">
                            <input type="radio" name="side" id="yes" className="peer hidden" checked={side === 1} onChange={() => setSide(1)} />
                            <label htmlFor="yes" className="w-full h-full flex items-center justify-center rounded-xl text-slate-400 font-bold text-lg cursor-pointer transition-all peer-checked:bg-blue-600 peer-checked:text-white peer-checked:shadow-md">
                                SÍ <span className="text-xs ml-1 opacity-80 font-medium tracking-normal">(Odds dinámicas)</span>
                            </label>
                        </div>
                        {/* NO Button */}
                        <div className="flex-1 relative z-10">
                            <input type="radio" name="side" id="no" className="peer hidden" checked={side === 0} onChange={() => setSide(0)} />
                            <label htmlFor="no" className="w-full h-full flex items-center justify-center rounded-xl text-slate-400 font-bold text-lg cursor-pointer transition-all peer-checked:bg-[#ef4444] peer-checked:text-white peer-checked:shadow-md">
                                NO <span className="text-xs ml-1 opacity-80 font-medium tracking-normal">(Odds dinámicas)</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* 2. Amount */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-3">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">2. Monto (ETH)</label>
                        <button onClick={() => navigate('/deposit')} className="text-xs font-bold text-blue-400 flex items-center gap-1 bg-blue-400/10 px-2 py-1 rounded hover:bg-blue-400/20 transition-colors">
                            <span className="material-symbols-outlined text-[14px]">account_balance_wallet</span> Saldo: {displayBalance}
                        </button>
                    </div>

                    {/* Big Input */}
                    <div className="relative mb-4">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">Ξ</span>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-[#1c2633] border-2 border-white/10 focus:border-blue-500 rounded-2xl py-4 pl-10 pr-4 text-3xl font-bold text-white outline-none transition-colors remove-arrow placeholder-slate-600"
                            placeholder="0.00"
                        />
                    </div>

                    {/* Quick Chips */}
                    <div className="flex gap-3">
                        {['0.001', '0.01', '0.1', '1'].map((amt) => (
                            <button key={amt} onClick={() => setAmount(amt)} className="flex-1 py-3 rounded-xl border border-white/10 bg-[#1c2633] hover:bg-white/5 text-sm font-bold text-slate-200 active:scale-95 transition-transform shadow-sm">
                                {amt} Ξ
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. Summary */}
                <div className="bg-[#1c2633] rounded-2xl p-5 border border-white/5 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-400">Total a Pagar</span>
                        <span className="text-white font-bold">{amount || "0"} ETH</span>
                    </div>
                </div>
            </main>

            {/* Footer CTA */}
            <div className="fixed bottom-0 w-full max-w-[480px] left-1/2 -translate-x-1/2 z-50 bg-[#0b0d10] border-t border-white/5 pb-safe pt-3 px-4 shadow-[0_-5px_20px_rgba(0,0,0,0.4)]">
                <button
                    onClick={handleConfirm}
                    className={`w-full h-14 rounded-xl font-bold text-lg shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2 mb-2 ${insufficientFunds
                        ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-900/20'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40'
                        }`}
                >
                    {insufficientFunds ? (
                        <>
                            <span className="material-symbols-outlined">add_card</span>
                            Depositar Fondos
                        </>
                    ) : (
                        "Confirmar Predicción"
                    )}
                </button>
                <p className="text-center text-[10px] text-slate-400 pb-2">Se aplican términos y condiciones.</p>
            </div>
        </div>
    );
};

export default ParticipationScreen;