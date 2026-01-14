import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useToast } from '../context/ToastContext';
import { useBlockchain, USDT_ADDRESS, USDC_ADDRESS } from '../context/BlockchainContext';
import { useUser } from '../context/UserContext';
import { usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';

const MyBetsSection = ({ account }: { account: string | null }) => {
    const { contract } = useBlockchain();
    const { showToast } = useToast();
    const [myBets, setMyBets] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchBets = async () => {
            if (!contract || !account) return;
            setLoading(true);
            try {
                const allMarkets = await contract.allMarkets();
                const userBets: any[] = [];

                for (let m of allMarkets) {
                    const id = Number(m.id);
                    // Check user shares in parallel to speed up
                    const [yesSharesBN, noSharesBN] = await Promise.all([
                        contract.userYesShares(id, account),
                        contract.userNoShares(id, account)
                    ]);
                    const yesShares = Number(ethers.formatUnits(yesSharesBN, 6));
                    const noShares = Number(ethers.formatUnits(noSharesBN, 6));

                    if (yesShares > 0 || noShares > 0) {
                        userBets.push({
                            id,
                            title: m.question,
                            resolved: m.resolved,
                            outcome: Number(m.outcome), // 1: YES, 0: NO
                            yesShares,
                            noShares
                        });
                    }
                }
                setMyBets(userBets);
            } catch (err) {
                console.error("Error fetching bets:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBets();
    }, [contract, account]);

    const handleClaim = async (marketId: number) => {
        if (!contract) return;
        try {
            showToast("⏳ Reclamando premio...");
            const tx = await contract.claimWinnings(marketId);
            await tx.wait();
            showToast("✅ ¡Premio reclamado con éxito!");
            // Refresh logic could go here, or simple reload
            window.location.reload();
        } catch (error: any) {
            console.error("Claim error:", error);
            showToast("❌ Error al reclamar: " + (error.reason || "Error desconocido"));
        }
    };

    if (loading) return <div className="text-center text-xs text-slate-500 py-4">Cargando tus apuestas...</div>;
    if (myBets.length === 0) return null;

    return (
        <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Mis Apuestas</h3>
            <div className="space-y-3">
                {myBets.map((bet) => {
                    const didWin = bet.resolved && ((bet.outcome === 1 && bet.yesShares > 0) || (bet.outcome === 0 && bet.noShares > 0));

                    return (
                        <div key={bet.id} className={`bg-[#15171b] p-4 rounded-2xl border ${didWin ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/5'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="text-sm font-bold text-slate-200 leading-tight pr-4">{bet.title}</h4>
                                {bet.resolved ? (
                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${didWin ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                                        {didWin ? 'Ganaste' : 'Finalizado'}
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">En curso</span>
                                )}
                            </div>
                            <div className="flex justify-between items-end">
                                <div className="flex gap-3 text-xs">
                                    {bet.yesShares > 0 && <span className="text-emerald-400 font-bold">{bet.yesShares.toFixed(2)} SÍ</span>}
                                    {bet.noShares > 0 && <span className="text-red-400 font-bold">{bet.noShares.toFixed(2)} NO</span>}
                                </div>
                                {didWin && (
                                    <button
                                        onClick={() => handleClaim(bet.id)}
                                        className="bg-emerald-500 hover:bg-emerald-400 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-lg shadow-emerald-900/40 active:scale-95 transition-all flex items-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">payments</span> Reclamar
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const ProfileScreen: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { logout, user } = usePrivy();
    const { account, getERC20Contract, provider } = useBlockchain();
    const { username, setUsername } = useUser();

    const [isEditing, setIsEditing] = useState(false);
    const [tempName, setTempName] = useState(username);
    const [totalBalance, setTotalBalance] = useState("0.00");
    const [loadingBalance, setLoadingBalance] = useState(false);

    useEffect(() => {
        const fetchBalance = async () => {
            if (account && getERC20Contract) {
                try {
                    setLoadingBalance(true);
                    const usdtContract = getERC20Contract(USDT_ADDRESS);
                    const usdcContract = getERC20Contract(USDC_ADDRESS);

                    if (usdtContract && usdcContract) {
                        const [uBal, cBal] = await Promise.all([
                            usdtContract.balanceOf(account),
                            usdcContract.balanceOf(account)
                        ]);
                        const total = Number(ethers.formatUnits(uBal, 6)) + Number(ethers.formatUnits(cBal, 6));
                        setTotalBalance(total.toFixed(2));
                    }
                } catch (error) {
                    console.error("Error fetching balance:", error);
                } finally {
                    setLoadingBalance(false);
                }
            }
        };
        fetchBalance();
    }, [account, getERC20Contract]);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const saveName = () => {
        if (tempName.trim()) {
            setUsername(tempName);
            setIsEditing(false);
            showToast("✅ Nombre de usuario actualizado");
        }
    };

    // Identificador visual
    const displayId = user?.id ? user.id.slice(0, 8) : "---";

    const menuItems = [
        { icon: 'person', text: 'Datos Personales', path: 'datos-personales' },
        { icon: 'credit_card', text: 'Métodos de Pago', path: 'pagos' },
        { icon: 'notifications', text: 'Notificaciones', path: '/notifications' },
        { icon: 'support_agent', text: 'Ayuda y Soporte', path: '/support' },
    ];

    return (
        <div className="relative flex h-full min-h-screen w-full flex-col bg-[#0b0d10] text-white pb-24">
            <header className="sticky top-0 z-20 flex items-center bg-[#0b0d10]/95 backdrop-blur-xl p-4 border-b border-white/5">
                <h2 className="text-lg font-bold flex-1 text-center pl-8">Mi Perfil</h2>
                <button onClick={handleLogout} className="text-xs font-bold text-red-500 hover:text-red-400 p-2 transition-colors">Salir</button>
            </header>
            {/* Main content injected below */}
            <main className="p-5 flex flex-col gap-8">
                {/* Header Profile */}
                <div className="flex items-center gap-5 pb-2">
                    <div className="w-20 h-20 rounded-full bg-slate-700 bg-cover bg-center border-2 border-white/10 shadow-lg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop')" }}></div>
                    <div className="flex flex-col flex-1">
                        {isEditing ? (
                            <div className="flex items-center gap-2">
                                <input
                                    value={tempName}
                                    onChange={(e) => setTempName(e.target.value)}
                                    className="bg-[#1c1f26] border border-blue-500/50 rounded-lg px-2 py-1 text-white text-lg font-bold w-full outline-none"
                                    autoFocus
                                />
                                <button onClick={saveName} className="text-emerald-400 p-1">
                                    <span className="material-symbols-outlined">check</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold tracking-tight text-white break-all line-clamp-1">{username}</h1>
                                <button onClick={() => setIsEditing(true)} className="text-slate-500 hover:text-white transition-colors">
                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                </button>
                            </div>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-500/10 text-xs font-bold text-blue-400 border border-blue-500/20">
                                Nivel: Novato
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold font-mono">ID: {displayId}</span>
                        </div>
                    </div>
                </div>

                {/* Balance Card */}
                <div className="bg-blue-600 text-white rounded-2xl p-6 shadow-xl shadow-blue-900/20 relative overflow-hidden ring-1 ring-white/10">
                    <div className="absolute -top-4 -right-4 p-4 opacity-10 rotate-12 pointer-events-none">
                        <span className="material-symbols-outlined text-[100px]">account_balance_wallet</span>
                    </div>
                    <div className="relative z-10">
                        <span className="text-xs font-bold text-blue-100 uppercase tracking-wider mb-1 block">Saldo Total</span>
                        <div className="flex items-end justify-between">
                            <h2 className="text-3xl font-black tracking-tight">${loadingBalance ? "..." : totalBalance}</h2>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => navigate('/deposit')} className="flex-1 bg-white text-blue-600 py-3 rounded-xl text-sm font-bold shadow-md active:scale-95 active:bg-slate-100 transition-all flex items-center justify-center gap-1">
                                <span className="material-symbols-outlined text-lg">add</span> Depositar
                            </button>
                            <button onClick={() => navigate('/withdraw')} className="flex-1 bg-black/20 text-white py-3 rounded-xl text-sm font-bold hover:bg-black/30 active:scale-95 transition-all border border-white/10 flex items-center justify-center gap-1">
                                <span className="material-symbols-outlined text-lg">arrow_upward</span> Retirar
                            </button>
                        </div>
                    </div>
                </div>

                {/* My Bets Section */}
                <MyBetsSection account={account} />

                {/* Config List */}
                <div className="flex flex-col gap-3">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Configuración</h3>
                    <div className="bg-[#15171b] rounded-2xl border border-white/5 overflow-hidden shadow-sm">
                        <button onClick={() => navigate('/portfolio')} className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors border-b border-white/5 text-left group active:bg-white/10">
                            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-colors">
                                <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                            </div>
                            <span className="text-[14px] font-semibold flex-1 text-slate-200 group-hover:text-white transition-colors">Mi Cartera</span>
                            <span className="material-symbols-outlined text-slate-500 text-lg group-hover:translate-x-1 transition-transform">chevron_right</span>
                        </button>
                        {menuItems.map((item, i) => (
                            <button
                                key={i}
                                onClick={() => item.path.startsWith('/') ? navigate(item.path) : navigate(`/settings/${item.path}`)}
                                className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 text-left group active:bg-white/10"
                            >
                                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                                </div>
                                <span className="text-[14px] font-semibold flex-1 text-slate-200 group-hover:text-white transition-colors">{item.text}</span>
                                <span className="material-symbols-outlined text-slate-500 text-lg group-hover:translate-x-1 transition-transform">chevron_right</span>
                            </button>
                        ))}
                        <button onClick={handleLogout} className="w-full flex items-center gap-4 p-4 hover:bg-red-500/5 transition-colors text-left group active:bg-red-500/10">
                            <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 transition-colors">
                                <span className="material-symbols-outlined text-[20px]">logout</span>
                            </div>
                            <span className="text-[14px] font-semibold flex-1 text-red-400 group-hover:text-red-300 transition-colors">Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            </main>
            <BottomNav />
        </div >
    );
};

export default ProfileScreen;