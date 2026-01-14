const hre = require("hardhat");

async function main() {
    const contractAddress = "0x26C9a9291AC1fc324C2685c1e090c41fB8bfBE9a";

    console.log("--- Iniciando Semilla de Mercados (CJS) ---");

    const PredictionMarket = await hre.ethers.getContractAt("PredictionMarket", contractAddress);

    console.log("Creando mercado 1...");
    try {
        const tx1 = await PredictionMarket.createMarket("¿Ganará Argentina el próximo partido?");
        console.log("Tx enviada:", tx1.hash);
        await tx1.wait();
        console.log("Mercado 1: ¡Listo! ✅");
    } catch (err) {
        console.log("Error creando mercado 1:", err.message);
    }

    console.log("Creando mercado 2...");
    try {
        const tx2 = await PredictionMarket.createMarket("¿Llegará el Bitcoin a 100k este mes?");
        console.log("Tx enviada:", tx2.hash);
        await tx2.wait();
        console.log("Mercado 2: ¡Listo! ✅");
    } catch (err) {
        console.log("Error creando mercado 2:", err.message);
    }

    console.log("--- Proceso terminado. ---");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
