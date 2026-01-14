import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallets } from '@privy-io/react-auth';
import PredictionMarketABI from '../abi/PredictionMarket.json';

const CONTRACT_ADDRESS = (import.meta as any).env?.VITE_CONTRACT_ADDRESS || "0x26C9a9291AC1fc324C2685c1e090c41fB8bfBE9a";
export const USDT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";
export const USDC_ADDRESS = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";

const ERC20_ABI = [
    "function balanceOf(address account) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function decimals() view returns (uint8)"
];

interface BlockchainContextType {
    provider: ethers.BrowserProvider | null;
    signer: ethers.Signer | null;
    contract: ethers.Contract | null;
    account: string | null;
    isReady: boolean;
    getERC20Contract: (address: string) => ethers.Contract | null;
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

export const BlockchainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { wallets } = useWallets();
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
    const [signer, setSigner] = useState<ethers.Signer | null>(null);
    const [contract, setContract] = useState<ethers.Contract | null>(null);
    const [account, setAccount] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const init = async () => {
            if (wallets && wallets.length > 0) {
                try {
                    const wallet = wallets[0];
                    const eip1193Provider = await wallet.getEthereumProvider();
                    const browserProvider = new ethers.BrowserProvider(eip1193Provider);
                    const s = await browserProvider.getSigner();
                    const c = new ethers.Contract(CONTRACT_ADDRESS, PredictionMarketABI.abi, s);

                    setProvider(browserProvider);
                    setSigner(s);
                    setContract(c);
                    setAccount(wallet.address);
                    setIsReady(true);
                } catch (e) {
                    console.error("Blockchain init error:", e);
                    setIsReady(false);
                }
            } else {
                setAccount(null);
                setContract(null);
                setIsReady(false);
            }
        };
        init();
    }, [wallets]);

    const getERC20Contract = (address: string) => {
        if (!signer) return null;
        return new ethers.Contract(address, ERC20_ABI, signer);
    };

    return (
        <BlockchainContext.Provider value={{ provider, signer, contract, account, isReady, getERC20Contract }}>
            {children}
        </BlockchainContext.Provider>
    );
};

export const useBlockchain = () => {
    const context = useContext(BlockchainContext);
    if (!context) throw new Error('useBlockchain must be used within BlockchainProvider');
    return context;
};
