import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

const SoporteScreen: React.FC = () => {
    const navigate = useNavigate();
    const [openIdx, setOpenIdx] = useState<number | null>(null);

    const faqs = [
        { q: "¿Cómo funcionan las predicciones?", a: "Tú compras posiciones de 'SÍ' o 'NO' usando ETH. Si tu predicción es correcta al finalizar el mercado, recibes una parte proporcional del pozo total acumulado." },
        { q: "¿Qué es Sepolia?", a: "Es una red de prueba (Testnet) de Ethereum. Los fondos que usas aquí no tienen valor real, lo que te permite aprender a usar la plataforma sin riesgo." },
        { q: "¿Puedo retirar mis ganancias?", a: "Sí, puedes retirar tus fondos desde la sección Mi Perfil -> Retirar a cualquier billetera externa compatible con Sepolia o Polygon." },
        { q: "¿Cómo se resuelven los mercados?", a: "Nuestros oráculos consultan fuentes de noticias oficiales. Una vez que el resultado es innegable, el mercado se liquida y los ganadores pueden reclamar sus premios." }
    ];

    return (
        <div className="bg-[#0b0d10] min-h-screen flex flex-col text-white pb-24">
            <header className="sticky top-0 z-40 bg-[#0b0d10]/95 backdrop-blur-xl border-b border-white/5 px-4 py-4 flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/5">
                    <span className="material-symbols-outlined text-slate-400">arrow_back</span>
                </button>
                <h2 className="text-xl font-bold">Ayuda y Soporte</h2>
            </header>

            <main className="flex-1 p-4">
                <div className="bg-blue-600/10 border border-blue-500/20 rounded-3xl p-6 mb-8 text-center relative overflow-hidden">
                    <div className="relative z-10">
                        <span className="material-symbols-outlined text-4xl text-blue-400 mb-3">contact_support</span>
                        <h3 className="text-lg font-bold mb-2">¿Necesitas hablar con un humano?</h3>
                        <p className="text-xs text-blue-200/60 mb-6 px-4">Nuestro equipo de soporte está disponible 24/7 para ayudarte con tus dudas en español.</p>
                        <button className="w-full bg-white text-blue-600 py-3 rounded-xl font-black text-xs shadow-lg shadow-blue-900/10 active:scale-95 transition-all">
                            ABRIR CHAT DE SOPORTE
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Preguntas Frecuentes</h4>
                    {faqs.map((f, i) => (
                        <div
                            key={i}
                            onClick={() => setOpenIdx(openIdx === i ? null : i)}
                            className="bg-[#15171b] border border-white/5 rounded-2xl overflow-hidden active:bg-[#1a1d21] transition-all cursor-pointer"
                        >
                            <div className="p-4 flex justify-between items-center">
                                <span className="text-sm font-bold text-slate-200">{f.q}</span>
                                <span className={`material-symbols-outlined text-slate-500 transition-transform ${openIdx === i ? 'rotate-180' : ''}`}>expand_more</span>
                            </div>
                            {openIdx === i && (
                                <div className="px-4 pb-4 animate-slide-down">
                                    <p className="text-xs text-slate-400 leading-relaxed pt-2 border-t border-white/5">
                                        {f.a}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center opacity-40">
                    <p className="text-[10px] font-medium text-slate-500">LatamPredict v1.2.0 • Hecho con ❤️ para Latam</p>
                </div>
            </main>
            <BottomNav />
        </div>
    );
};

export default SoporteScreen;
