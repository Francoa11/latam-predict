import { ethers } from "ethers";

// Aquí pondrás la dirección que te dé Antigravity al desplegar
const CONTRACT_ADDRESS = "0x..."; 
const ABI = [ /* Aquí pegas el ABI que generó Hardhat */ ];

export const connectAndPredict = async (marketId: number, amount: string, side: 'YES' | 'NO') => {
  if (!window.ethereum) return alert("Instala MetaMask");
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

  // Llamada real al contrato
  const tx = await contract.buyShares(marketId, side === 'YES' ? 0 : 1, {
    value: ethers.parseEther(amount)
  });
  return await tx.wait();
};