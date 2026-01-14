import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PrivyProvider } from '@privy-io/react-auth';

// --- Contexts ---
import { UserProvider } from './context/UserContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { BlockchainProvider } from './context/BlockchainContext';

// --- Screens ---
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import ExploreScreen from './screens/ExploreScreen';
import PortfolioScreen from './screens/PortfolioScreen';
import ProfileScreen from './screens/ProfileScreen';
import MarketDetailScreen from './screens/MarketDetailScreen';
import ParticipationScreen from './screens/ParticipationScreen';
import DepositScreen from './screens/DepositScreen';
import WithdrawScreen from './screens/WithdrawScreen';
import NotificationScreen from './screens/NotificationScreen';
import SoporteScreen from './screens/SoporteScreen';
import SettingsDetailScreen from './screens/SettingsDetailScreen';
import RankingScreen from './screens/RankingScreen';

const PRIVY_APP_ID = (import.meta as any).env?.VITE_PRIVY_APP_ID || "cmkau6tu800wzjs0cyi73mu30";

const polygon = {
    id: 137,
    name: 'Polygon',
    network: 'polygon',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://polygon-rpc.com'] },
        public: { http: ['https://polygon-rpc.com'] },
    },
    testnet: false,
};

// --- App Shell to use Toast ---
const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { toastMsg } = useToast();
    return (
        <div className="flex flex-col min-h-screen bg-[#0b0d10] text-white">
            <div className="flex-1 w-full max-w-[480px] mx-auto bg-[#0b0d10] relative shadow-2xl min-h-screen border-x border-white/5">
                {children}

                {toastMsg && (
                    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[300] animate-fade-in w-full max-w-[440px] px-4">
                        <div className="bg-[#1e293b] text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3 backdrop-blur-md">
                            <span className="material-symbols-outlined text-blue-400">info</span>
                            <span className="text-sm font-bold">{toastMsg}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <PrivyProvider
            appId={PRIVY_APP_ID}
            config={{
                loginMethods: ['google', 'email', 'wallet'],
                appearance: {
                    theme: 'dark',
                    accentColor: '#2563eb',
                    logo: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=200&auto=format&fit=crop',
                },
                embeddedWallets: {
                    ethereum: {
                        createOnLogin: 'users-without-wallets',
                    }
                },
                defaultChain: polygon,
                supportedChains: [polygon],
            }}
        >
            <UserProvider>
                <ToastProvider>
                    <BlockchainProvider>
                        <Router>
                            <AppShell>
                                <Routes>
                                    <Route path="/" element={<HomeScreen />} />
                                    <Route path="/login" element={<OnboardingScreen />} />
                                    <Route path="/home" element={<Navigate to="/" replace />} />
                                    <Route path="/explore" element={<ExploreScreen />} />
                                    <Route path="/ranking" element={<RankingScreen />} />
                                    <Route path="/portfolio" element={<PortfolioScreen />} />
                                    <Route path="/profile" element={<ProfileScreen />} />
                                    <Route path="/market/:id" element={<MarketDetailScreen />} />
                                    <Route path="/deposit" element={<DepositScreen />} />
                                    <Route path="/withdraw" element={<WithdrawScreen />} />
                                    <Route path="/notifications" element={<NotificationScreen />} />
                                    <Route path="/support" element={<SoporteScreen />} />
                                    <Route path="/settings/:type" element={<SettingsDetailScreen />} />
                                    <Route path="/participate/:id" element={<ParticipationScreen />} />
                                </Routes>
                            </AppShell>
                        </Router>
                    </BlockchainProvider>
                </ToastProvider>
            </UserProvider>
        </PrivyProvider>
    );
};

export default App;
