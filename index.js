import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } from "@whiskeysockets/baileys";
import pino from "pino";
import readlineSync from "readline-sync";

async function startShadow() {
    const { state, saveCreds } = await useMultiFileAuthState('./sessions');
    const { version } = await fetchLatestBaileysVersion();
    
    const sock = makeWASocket({
        version,
        logger: pino({ level: "silent" }),
        auth: state,
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    if (!sock.authState.creds.registered) {
        console.log("\n亗 Sηαdοωβοτ - VINCULACIÓN 亗");
        const num = readlineSync.question('📝 Ingresa tu numero (ej: 519XXXXXXXX): ').replace(/\D/g, "");
        
        // Esperamos 3 segundos para evitar el error de conexión cerrada
        console.log("\n⏳ Generando código, por favor espera...");
        await new Promise(resolve => setTimeout(resolve, 3000));

        try {
            const code = await sock.requestPairingCode(num);
            console.log('\n🔑 TU CÓDIGO ES:', code, '\n');
        } catch (err) {
            console.log("\n❌ Error al generar el código. Reintenta de nuevo.");
            console.error(err);
        }
    }

    sock.ev.on("connection.update", (up) => {
        const { connection, lastDisconnect } = up;
        if (connection === "open") console.log("\n✅ ¡CONECTADO EXITOSAMENTE!");
        if (connection === "close") {
            console.log("🔄 Conexión cerrada, reconectando...");
            startShadow();
        }
    });

    sock.ev.on("creds.update", saveCreds);
}
startShadow().catch(console.error);