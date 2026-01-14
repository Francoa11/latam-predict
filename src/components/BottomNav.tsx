import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const BottomNav = () => {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    const NavItem = ({ to, icon, label }: { to: string, icon: string, label: string }) => {
        const active = isActive(to);
        return (
            <li className="flex-1">
                <Link to={to} className="flex flex-col items-center justify-center gap-1 h-full py-1 group transition-all">
                    <span className={`material-symbols-outlined text-[24px] transition-transform group-active:scale-90 ${active ? 'text-blue-500 font-variation-settings-fill-1' : 'text-slate-500'}`}>
                        {icon}
                    </span>
                    <span className={`text-[10px] font-bold ${active ? 'text-blue-500' : 'text-slate-500'}`}>
                        {label}
                    </span>
                </Link>
            </li>
        );
    };

    return (
        <div className="fixed bottom-0 left-0 w-full z-[100] flex justify-center pointer-events-none">
            <nav className="w-full max-w-[480px] bg-[#0b0d10] border-t border-white/10 pb-safe pt-1 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] pointer-events-auto">
                <ul className="flex justify-between items-center w-full h-[60px] px-1">
                    <NavItem to="/" icon="home" label="Inicio" />
                    <NavItem to="/explore" icon="search" label="Explorar" />
                    <NavItem to="/ranking" icon="leaderboard" label="Ranking" />
                    <NavItem to="/profile" icon="person" label="Perfil" />
                </ul>
            </nav>
        </div>
    );
};

export default BottomNav;