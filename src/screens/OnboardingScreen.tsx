import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import { useToast } from '../context/ToastContext';

const OnboardingScreen: React.FC = () => {
    const navigate = useNavigate();
    const { login, ready, authenticated } = usePrivy();
    const { showToast } = useToast();

    // Redirección automática si ya inició sesión
    useEffect(() => {
        if (ready && authenticated) {
            navigate('/');
        }
    }, [ready, authenticated, navigate]);

    const handleGoogleLogin = () => {
        if (!ready) {
            showToast("Iniciando servicios... intenta de nuevo.");
            return;
        }
        try {
            // Intentamos loguear con Google específicamente
            login({ loginMethods: ['google'] });
        } catch (e) {
            console.error("Login detail error:", e);
            // Fallback al modal general
            login();
        }
    };

    const handleEmailLogin = () => {
        if (!ready) return;
        login({ loginMethods: ['email'] });
    };

    const handleWalletLogin = () => {
        if (!ready) return;
        login({ loginMethods: ['wallet'] });
    };

    return (
        <div className="h-full w-full bg-[#0b0d10] flex flex-col items-center justify-center p-6 relative overflow-hidden flex-1">
            {/* Background Decor */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-sm z-10 flex flex-col h-full justify-center">
                {/* Logo */}
                <div className="flex justify-center mb-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center transform rotate-45">
                            <div className="w-5 h-5 bg-[#0b0d10] transform -rotate-45"></div>
                        </div>
                        <span className="text-3xl font-bold tracking-tight text-white">LatamPredict</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-white text-center mb-6">Bienvenido</h2>

                    {/* Google Button */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={!ready}
                        className={`w-full bg-white text-black hover:bg-slate-200 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] text-[15px] ${!ready ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="G" />
                        Continuar con Google
                    </button>

                    {/* Email Button */}
                    <button onClick={handleEmailLogin} disabled={!ready} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98] text-[15px] flex items-center justify-center gap-3">
                        <span className="material-symbols-outlined text-[20px]">mail</span>
                        Continuar con Email
                    </button>

                    <div className="relative py-3">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#0b0d10] px-2 text-slate-500 font-medium">O</span>
                        </div>
                    </div>

                    {/* Wallet Button */}
                    <button onClick={handleWalletLogin} disabled={!ready} className="w-full bg-[#1a1d21] text-white hover:bg-[#25282e] font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-3 border border-white/5 active:scale-[0.98] text-[15px]">
                        <span className="material-symbols-outlined text-xl text-orange-500">account_balance_wallet</span>
                        Ya tengo Billetera
                    </button>

                    <p className="text-center text-xs text-slate-500 mt-4">
                        Powered by <span className="font-bold text-slate-400">Privy</span> · Billeteras instantáneas
                    </p>
                </div>

                <p className="text-center text-[11px] text-slate-500 mt-8 leading-relaxed px-4">
                    Al continuar, aceptas nuestros <a href="#" className="text-slate-400 hover:text-white">Términos</a> y <a href="#" className="text-slate-400 hover:text-white">Privacidad</a>.
                </p>
            </div>
        </div>
    );
};

export default OnboardingScreen;