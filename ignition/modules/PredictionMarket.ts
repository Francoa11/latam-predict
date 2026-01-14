import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const PredictionMarketModule = buildModule("PredictionMarketModule", (m) => {
  // Aquí usamos el nombre del contrato que está en tu carpeta contracts
  const market = m.contract("PredictionMarket");

  return { market };
});

export default PredictionMarketModule;