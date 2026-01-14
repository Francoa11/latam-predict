import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useBlockchain, USDT_ADDRESS, USDC_ADDRESS } from '../context/BlockchainContext';
import { useToast } from '../context/ToastContext';
import { ethers } from 'ethers';

const ParticipationScreen: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const { contract, account, getERC20Contract } = useBlockchain();
    const { showToast } = useToast();
    const [step, setStep] = useState<'form' | 'success'>('form');

    const [side, setSide] = useState<number>(location.state?.side !== undefined ? location.state.side : 1);
    const [amount, setAmount] = useState<string>("5.00");
    const [token, setToken] = useState<0 | 1>(0); // 0: USDT, 1: USDC
    const [balance, setBalance] = useState<bigint>(BigInt(0));
    const [loadingBalance, setLoadingBalance] = useState(false);

    // Potentials
    const [poolData, setPoolData] = useState<{ yes: number, no: number }>({ yes: 0, no: 0 });
    const [potentialInfo, setPotentialInfo] = useState({ total: "0.00", profit: 0, roi: 0 });

    useEffect(() => {
        const fetchPool = async () => {
            if (contract && id) {
                try {
                    // Fetch market data directly to ensure freshness
                    const m = await contract.markets(id);
                    // m.yesVotes and m.noVotes are indices 5 and 6 in struct (approximated, or accessing by name if supported)
                    // ethers v6 struct result supports .name access
                    setPoolData({
                        yes: Number(ethers.formatUnits(m.yesVotes, 6)),
                        no: Number(ethers.formatUnits(m.noVotes, 6))
                    });
                } catch (e) { console.error("Pool fetch error", e); }
            }
        };
        fetchPool();
    }, [contract, id]);

    useEffect(() => {
        const amt = Number(amount);
        if (!amt || amt <= 0) {
            setPotentialInfo({ total: "0.00", profit: 0, roi: 0 });
            return;
        }

        // Parimutuel Calc
        // If I bet on YES: My Share = Amt / (YesPool + Amt). Payout = Share * (TotalPool + Amt)
        // Payout = (Amt * (YesPool + NoPool + Amt)) / (YesPool + Amt)
        // Profit = Payout - Amt
        const Y = poolData.yes;
        const N = poolData.no;

        let payout = 0;
        if (side === 1) { // Betting YES
            payout = (amt * (Y + N + amt)) / (Y + amt);
        } else { // Betting NO
            payout = (amt * (Y + N + amt)) / (N + amt);
        }

        // Safety for initial markets with 0 liquidity (handling NaN/Inf)
        if (isNaN(payout) || !payout) payout = amt; // Fallback: 1x if alone

        const profit = payout - amt;
        const roi = (profit / amt) * 100;

        setPotentialInfo({
            total: payout.toFixed(2),
            profit: Number(profit.toFixed(2)),
            roi: Number(roi.toFixed(1))
        });
    }, [amount, side, poolData]);

    useEffect(() => {
        const fetchBalance = async () => {
            if (account && getERC20Contract) {
                try {
                    setLoadingBalance(true);
                    const tokenAddr = token === 0 ? USDT_ADDRESS : USDC_ADDRESS;
                    const tokenContract = getERC20Contract(tokenAddr);
                    if (tokenContract) {
                        const bal = await tokenContract.balanceOf(account);
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
    }, [account, token, getERC20Contract]);

    const getInsufficientFunds = () => {
        try {
            if (!amount || isNaN(Number(amount))) return false;
            const value = ethers.parseUnits(amount, 6);
            return balance < value;
        } catch { return false; }
    };

    const insufficientFunds = getInsufficientFunds();
    const displayBalance = loadingBalance ? "..." : Number(ethers.formatUnits(balance, 6)).toFixed(2);

    const handleConfirm = async () => {
        if (!contract || !getERC20Contract || !account) {
            showToast("⚠️ Conecta tu Billetera");
            return;
        }
        if (insufficientFunds) {
            navigate('/deposit');
            return;
        }
        try {
            const tokenAddr = token === 0 ? USDT_ADDRESS : USDC_ADDRESS;
            const tokenContract = getERC20Contract(tokenAddr);
            if (!tokenContract) return;

            const value = ethers.parseUnits(amount, 6);
            const contractAddr = await contract.getAddress();

            showToast("⏳ Verificando permiso...");
            const allowance = await tokenContract.allowance(account, contractAddr);

            if (allowance < value) {
                showToast("⏳ Autorizando tokens...");
                const approveTx = await tokenContract.approve(contractAddr, ethers.MaxUint256);
                await approveTx.wait();
            }

            showToast("⏳ Confirmando compra...");
            const tx = await contract.buyShares(id, side, value, token);
            await tx.wait();

            setStep('success');
        } catch (error: any) {
            console.error(error);
            showToast("❌ Falló: " + (error.reason || "Error de red"));
        }
    };

    if (step === 'success') {
        return (
            <div className="bg-[#0b0d10] h-screen w-full flex flex-col items-center justify-center p-8 text-center animate-fade-in text-white">
                <div className="w-28 h-28 bg-emerald-500 rounded-[40px] flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/20 rotate-3">
                    <span className="material-symbols-outlined text-6xl text-[#0b0d10] font-black">check</span>
                </div>
                <h2 className="text-3xl font-black text-white mb-2 tracking-tight">¡Éxito Total!</h2>
                <p className="text-slate-400 mb-12 max-w-[280px] font-medium">
                    Tus posiciones para el Mercado #{id} han sido confirmadas.
                </p>
                <div className="w-full max-w-[320px] space-y-4">
                    <button onClick={() => navigate('/portfolio')} className="w-full h-14 bg-white text-black rounded-2xl font-black text-sm tracking-widest shadow-xl active:scale-95 transition-all">
                        IR A MI CARTERA
                    </button>
                    <button onClick={() => navigate('/')} className="w-full h-14 bg-white/5 text-slate-400 rounded-2xl font-black text-sm tracking-widest border border-white/5 hover:text-white transition-all">
                        VER MÁS MERCADOS
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#0b0d10] h-screen w-full flex flex-col text-white pb-safe">
            <header className="flex items-center justify-between px-6 py-4 bg-[#0b0d10] sticky top-0 z-50 w-full max-w-[480px] mx-auto border-b border-white/5">
                <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5">
                    <span className="material-symbols-outlined text-slate-400">arrow_back</span>
                </button>
                <h2 className="text-sm font-black uppercase tracking-[0.2em]">Confirmar</h2>
                <div className="w-10"></div>
            </header>

            <main className="flex-1 overflow-y-auto px-6 py-8 w-full max-w-[480px] mx-auto">
                {/* Visual Card with Toggle */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                    <button
                        onClick={() => setSide(1)}
                        className={`p-6 rounded-[24px] border transition-all relative overflow-hidden flex flex-col items-center justify-center gap-2 ${side === 1 ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-[#15171b] border-white/5 text-slate-500 hover:bg-white/5'}`}
                    >
                        <span className="material-symbols-outlined text-4xl">thumb_up</span>
                        <span className="text-xs font-black uppercase tracking-widest">SÍ SUCEDERÁ</span>
                        {side === 1 && <div className="absolute inset-0 border-2 border-emerald-500 rounded-[24px]"></div>}
                    </button>
                    <button
                        onClick={() => setSide(0)}
                        className={`p-6 rounded-[24px] border transition-all relative overflow-hidden flex flex-col items-center justify-center gap-2 ${side === 0 ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-[#15171b] border-white/5 text-slate-500 hover:bg-white/5'}`}
                    >
                        <span className="material-symbols-outlined text-4xl">thumb_down</span>
                        <span className="text-xs font-black uppercase tracking-widest">NO SUCEDERÁ</span>
                        {side === 0 && <div className="absolute inset-0 border-2 border-red-500 rounded-[24px]"></div>}
                    </button>
                </div>

                <div className="space-y-8">
                    {/* Amount Input */}
                    <div>
                        <div className="flex justify-between items-end mb-4 px-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Monto a Operar</label>
                            <span className="text-xs font-bold text-slate-400">Saldo: {displayBalance}</span>
                        </div>
                        <div className="relative mb-6">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className={`w-full bg-[#15171b] border rounded-3xl p-8 text-5xl font-black text-white text-center outline-none transition-all shadow-inner ${side === 1 ? 'focus:border-emerald-500 border-emerald-500/20' : 'focus:border-red-500 border-red-500/20'}`}
                                placeholder="0"
                            />
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-center">
                                <span className="text-xs font-black text-slate-500">USD</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                            {['5', '20', '50', '100'].map(v => (
                                <button key={v} onClick={() => setAmount(v)} className="py-3.5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 text-xs font-black transition-all active:scale-95">
                                    ${v}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Potential Winnings */}
                    <div className="bg-[#15171b] rounded-3xl p-6 border border-white/5 relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-1 h-full ${side === 1 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ganancia Potencial Estimada</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${side === 1 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                {side === 1 ? 'APOSTANDO AL SÍ' : 'APOSTANDO AL NO'}
                            </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-black text-white">
                                ${potentialInfo.total}
                            </h3>
                            <span className={`text-sm font-bold ${potentialInfo.roi >= 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                                ({potentialInfo.profit > 0 ? '+' : ''}{potentialInfo.profit})
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                            Calculado según la liquidez actual del mercado. Si ganas, recibirás tu parte proporcional del pozo total.
                        </p>
                    </div>

                    {/* Token & Fee Info */}
                    <div className="bg-[#15171b] rounded-3xl p-6 border border-white/5 space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-500">Activo</span>
                            <div className="flex gap-2">
                                <button onClick={() => setToken(0)} className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${token === 0 ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-500'}`}>USDT</button>
                                <button onClick={() => setToken(1)} className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${token === 1 ? 'bg-blue-500 text-white' : 'bg-white/5 text-slate-500'}`}>USDC</button>
                            </div>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-white/5">
                            <span className="text-xs font-bold text-slate-500">Comisión de Plataforma</span>
                            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">$0.00 (Promo)</span>
                        </div>
                    </div>
                </div>
            </main>

            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] p-6 bg-[#0b0d10] border-t border-white/5 z-50">
                <button
                    onClick={handleConfirm}
                    disabled={!amount || Number(amount) <= 0}
                    className={`w-full h-16 rounded-[24px] font-black text-sm tracking-[0.1em] shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 ${insufficientFunds ? 'bg-orange-500 text-white' : 'bg-blue-600 text-white'}`}
                >
                    {insufficientFunds ? 'RECARGAR SALDO' : `CONFIRMAR COMPRA`}
                    {!insufficientFunds && <span className="material-symbols-outlined text-[18px]">rocket_launch</span>}
                </button>
                <div className="mt-4 flex items-center justify-center gap-2 opacity-30">
                    <span className="material-symbols-outlined text-xs">shield_lock</span>
                    <span className="text-[9px] font-black uppercase tracking-widest">Ejecución Segura en Polygon Smart Contract</span>
                </div>
            </div>
        </div>
    );
};

export default ParticipationScreen;