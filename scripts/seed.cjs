const hre = require("hardhat");

async function main() {
    const contractAddress = "0x26C9a9291AC1fc324C2685c1e090c41fB8bfBE9a";

    console.log("--- Iniciando Semilla de Mercados (CJS) ---");

    const PredictionMarket = await hre.ethers.getContractAt("PredictionMarket", contractAddress);

    console.log("Creando mercado 1 (Cripto)...");
    try {
        const tx1 = await PredictionMarket.createMarket("¿Bitcoin superará los $150k antes de mediados de 2026?");
        console.log("Tx enviada:", tx1.hash);
        await tx1.wait();
        console.log("Mercado 1 (Cripto): ¡Listo! ✅");
    } catch (err) {
        console.log("Error creando mercado 1:", err.message);
    }

    console.log("Creando mercado 2 (Deportes)...");
    try {
        const tx2 = await PredictionMarket.createMarket("¿Argentina llegará a semifinales en el Mundial 2026?");
        console.log("Tx enviada:", tx2.hash);
        await tx2.wait();
        console.log("Mercado 2 (Deportes): ¡Listo! ✅");
    } catch (err) {
        console.log("Error creando mercado 2:", err.message);
    }

    console.log("Creando mercado 3 (Política/Economía)...");
    try {
        const tx3 = await PredictionMarket.createMarket("¿La inflación promedio de Latam bajará a un dígito en 2026?");
        console.log("Tx enviada:", tx3.hash);
        await tx3.wait();
        console.log("Mercado 3 (Política): ¡Listo! ✅");
    } catch (err) {
        console.log("Error creando mercado 3:", err.message);
    }

    console.log("--- Proceso terminado. ---");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
