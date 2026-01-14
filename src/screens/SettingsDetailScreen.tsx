import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const SettingsDetailScreen: React.FC = () => {
    const navigate = useNavigate();
    const { type } = useParams();

    const getContent = () => {
        switch (type) {
            case 'datos-personales':
                return {
                    title: "Datos Personales",
                    icon: "person",
                    fields: [
                        { label: "Nombre Completo", value: "Pendiente" },
                        { label: "Email", value: "Sincronizado con Privy" },
                        { label: "País", value: "No definido" }
                    ]
                };
            case 'verificacion':
                return {
                    title: "Verificación de Identidad",
                    icon: "verified_user",
                    desc: "Tu cuenta ha sido verificada satisfactoriamente para operar en mercados de predicción.",
                    status: "Verificado"
                };
            case 'pagos':
                return {
                    title: "Métodos de Pago",
                    icon: "credit_card",
                    desc: "Gestiona tus billeteras externas conectadas.",
                    list: ["Embedded Wallet (Activa)", "MetaMask (Pendiente)"]
                };
            default:
                return {
                    title: type?.replace('-', ' ').toUpperCase() || "Ajustes",
                    icon: "settings",
                    desc: "Esta sección se encuentra en mantenimiento programado."
                };
        }
    };

    const content = getContent();

    return (
        <div className="min-h-screen bg-[#0b0d10] flex flex-col text-white">
            <header className="flex items-center p-4 border-b border-white/5 bg-[#0b0d10] sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/5 transition-colors">
                    <span className="material-symbols-outlined text-slate-400">arrow_back</span>
                </button>
                <h1 className="flex-1 text-center font-bold text-lg pr-8">{content.title}</h1>
            </header>

            <main className="p-6 flex flex-col items-center">
                <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center mb-8 border border-blue-500/20">
                    <span className="material-symbols-outlined text-4xl text-blue-500">{content.icon}</span>
                </div>

                <div className="w-full max-w-[400px] bg-[#15171b] rounded-2xl border border-white/5 p-6 shadow-xl">
                    {content.fields ? (
                        <div className="space-y-6">
                            {content.fields.map((f, i) => (
                                <div key={i} className="border-b border-white/5 pb-4 last:border-0 last:pb-0">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">{f.label}</label>
                                    <p className="text-sm font-semibold text-slate-200">{f.value}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center">
                            <p className="text-sm text-slate-400 leading-relaxed">{content.desc}</p>
                            {content.status && (
                                <div className="mt-6 flex justify-center">
                                    <span className="bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-full text-xs font-bold border border-emerald-500/20">
                                        {content.status}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <button
                    onClick={() => navigate(-1)}
                    className="mt-12 w-full max-w-[400px] py-4 bg-white/5 hover:bg-white/10 text-slate-400 font-bold rounded-xl transition-all border border-white/10"
                >
                    Volver Atrás
                </button>
            </main>
        </div>
    );
};

export default SettingsDetailScreen;
