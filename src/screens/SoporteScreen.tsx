import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

const SoporteScreen: React.FC = () => {
    const navigate = useNavigate();
    const [openIdx, setOpenIdx] = useState<number | null>(null);

    const faqs = [
        { q: "¿Cómo funcionan las predicciones?", a: "Tú compras posiciones de 'SÍ' o 'NO' usando USDT o USDC. Si tu predicción es correcta al finalizar el mercado, recibes $1 por cada acción que poseas." },
        { q: "¿Qué red utiliza LatamPredict?", a: "Operamos exclusivamente en Polygon Mainnet. Esto nos permite ofrecer transacciones instantáneas y comisiones de casi $0 para todos nuestros usuarios." },
        { q: "¿Puedo retirar mis ganancias?", a: "¡Claro! Puedes retirar tus USDT/USDC acumulados en cualquier momento hacia una billetera externa compatible con la red Polygon desde la sección de Perfil." },
        { q: "¿Cómo se garantizan los pagos?", a: "Los fondos se bloquean en contratos inteligentes inmutables. Una vez que el oráculo confirma el resultado oficial, el contrato libera automáticamente los pagos a los ganadores." }
    ];

    return (
        <div className="bg-[#0b0d10] min-h-screen flex flex-col text-white pb-24">
            <header className="sticky top-0 z-40 bg-[#0b0d10]/95 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center gap-4 w-full max-w-[480px] mx-auto">
                <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5">
                    <span className="material-symbols-outlined text-slate-400">arrow_back</span>
                </button>
                <h2 className="text-sm font-black uppercase tracking-[0.2em]">Ayuda y Soporte</h2>
            </header>

            <main className="flex-1 p-6 w-full max-w-[480px] mx-auto">
                <div className="bg-blue-600/10 border border-blue-500/10 rounded-[40px] p-8 mb-10 text-center relative overflow-hidden group">
                    <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-blue-500/10 rounded-full blur-[40px]"></div>
                    <div className="relative z-10">
                        <span className="material-symbols-outlined text-4xl text-blue-400 mb-4">chat_bubble_outline</span>
                        <h3 className="text-xl font-black mb-2 tracking-tight">¿Dudas o Sugerencias?</h3>
                        <p className="text-xs text-blue-200/50 mb-8 px-4 font-medium leading-relaxed uppercase tracking-wider">Soporte 24/7 en español para toda Latinoamérica</p>
                        <button className="w-full bg-white text-[#0b0d10] py-4 rounded-2xl font-black text-xs tracking-widest shadow-xl active:scale-[0.98] transition-all">
                            ABRIR CHAT DE AYUDA
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 mb-2">Preguntas Frecuentes</h4>
                    {faqs.map((f, i) => (
                        <div
                            key={i}
                            onClick={() => setOpenIdx(openIdx === i ? null : i)}
                            className="bg-[#15171b] border border-white/5 rounded-3xl overflow-hidden active:bg-[#1a1d21] transition-all cursor-pointer shadow-sm group"
                        >
                            <div className="p-5 flex justify-between items-center">
                                <span className={`text-sm font-bold transition-colors ${openIdx === i ? 'text-white' : 'text-slate-300'}`}>{f.q}</span>
                                <span className={`material-symbols-outlined text-slate-600 transition-all ${openIdx === i ? 'rotate-180 text-blue-400' : ''}`}>expand_more</span>
                            </div>
                            {openIdx === i && (
                                <div className="px-5 pb-6 animate-slide-down">
                                    <p className="text-xs text-slate-400 leading-relaxed pt-4 border-t border-white/5 font-medium italic">
                                        {f.a}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center opacity-30">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">LatamPredict Pro • Version 1.5.0</p>
                </div>
            </main>
            <BottomNav />
        </div>
    );
};

export default SoporteScreen;
