import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path: string) => location.pathname === path;

  // Simulación de estado de sesión (cambiar a false para ver botones de login)
  const isLoggedIn = true; 

  const NavItem = ({ to, icon, label, isMore = false }: { to: string, icon: string, label: string, isMore?: boolean }) => (
    <Link to={to} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${isActive(to) ? 'bg-white/5 text-white font-semibold' : 'text-slate-400 hover:bg-white/5 hover:text-white font-medium'}`}>
        <span className={`material-symbols-outlined text-[22px] ${isActive(to) ? 'filled' : ''} ${isMore ? 'opacity-70' : ''}`}>{icon}</span>
        <span className="text-sm tracking-wide">{label}</span>
    </Link>
  );

  return (
    <aside className="hidden md:flex flex-col w-[240px] h-screen sticky top-0 bg-[#0b0d10] border-r border-white/5 pt-5 pb-6 px-3 shrink-0">
        {/* Logo Area */}
        <div className="flex items-center gap-2 px-3 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-xl">show_chart</span>
            </div>
            <h1 className="text-lg font-bold tracking-tight text-white">LatamPredict</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1">
            <NavItem to="/home" icon="home" label="Inicio" />
            <NavItem to="/explore" icon="search" label="Mercados" />
            <NavItem to="/news" icon="newspaper" label="Breaking" />
            <NavItem to="/ranking" icon="leaderboard" label="Ranking" />
            <NavItem to="/activity" icon="history" label="Actividad" />
            <div className="my-2 border-t border-white/5"></div>
            <NavItem to="/more" icon="more_horiz" label="Más" isMore={true} />
        </nav>

        {/* Auth / Profile Section */}
        <div className="mt-auto pt-4 border-t border-white/5 space-y-3">
            {isLoggedIn ? (
                <Link to="/profile" className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-[1px]">
                         <div className="w-full h-full rounded-full bg-[#0b0d10] flex items-center justify-center">
                            <span className="text-xs font-bold text-white">JP</span>
                         </div>
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-semibold text-slate-200 group-hover:text-white truncate">Juan Pérez</span>
                        <span className="text-xs text-emerald-500 font-mono font-medium">$4,500.00</span>
                    </div>
                    <span className="material-symbols-outlined text-slate-500 ml-auto text-lg">settings</span>
                </Link>
            ) : (
                <div className="flex flex-col gap-2 px-1">
                    <button onClick={() => navigate('/')} className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition-colors shadow-lg shadow-blue-900/20">
                        Registrarse
                    </button>
                    <button onClick={() => navigate('/')} className="w-full py-2.5 bg-[#1a1d21] hover:bg-[#25282e] text-slate-200 text-sm font-bold rounded-lg transition-colors border border-white/5">
                        Iniciar Sesión
                    </button>
                </div>
            )}
        </div>
    </aside>
  );
};

export default Sidebar;