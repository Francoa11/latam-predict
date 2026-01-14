import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const BottomNav = () => {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    const NavItem = ({ to, icon, label }: { to: string, icon: string, label: string }) => {
        const active = isActive(to);
        return (
            <li className="flex-1">
                <Link to={to} className={`flex flex-col items-center justify-center gap-1 h-full py-2 group transition-colors relative`}>
                    <span className={`material-symbols-outlined text-[26px] mb-0.5 transition-transform group-active:scale-90 ${active ? 'text-blue-500 filled' : 'text-slate-500 group-hover:text-slate-300'}`}>
                        {icon}
                    </span>
                    <span className={`text-[10px] font-bold tracking-wide ${active ? 'text-blue-500' : 'text-slate-500 group-hover:text-slate-300'}`}>
                        {label}
                    </span>
                    {/* Active Indicator Dot */}
                    {active && <span className="absolute top-1 w-1 h-1 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>}
                </Link>
            </li>
        );
    };

    return (
        <div className="fixed bottom-0 left-0 w-full z-[100] flex justify-center pointer-events-none">
            {/* Container constrained to mobile width, pointer-events-auto re-enables clicks */}
            <nav className="w-full max-w-[480px] bg-[#0b0d10] border-t border-white/10 pb-safe pt-1 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] pointer-events-auto">
                <ul className="flex justify-between items-center w-full h-[60px] px-1">
                    <NavItem to="/" icon="home" label="Inicio" />
                    <NavItem to="/explore" icon="search" label="Explorar" />
                    <NavItem to="/ranking" icon="trophy" label="Ranking" />
                    <NavItem to="/profile" icon="person" label="Perfil" />
                </ul>
            </nav>
        </div>
    );
};

export default BottomNav;