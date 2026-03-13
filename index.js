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

    // Función para pedir el código solo cuando la conexión esté lista
    const pedirCodigo = async () => {
        if (!sock.authState.creds.registered) {
            console.log("\n亗 Sηαdοωβοτ - VINCULACIÓN 亗");
            const num = readlineSync.question('📝 Ingresa tu numero (ej: 519XXXXXXXX): ').replace(/\D/g, "");
            
            console.log("\n⏳ Conectando con los servidores de WhatsApp...");
            // Esperamos un poco más para asegurar el handshake
            await new Promise(resolve => setTimeout(resolve, 6000));

            try {
                const code = await sock.requestPairingCode(num);
                console.log('\n🔑 TU CÓDIGO ES:', code, '\n');
            } catch (err) {
                console.log("\n❌ Error. Posiblemente el número está mal o la conexión falló. Reintenta.");
                process.exit();
            }
        }
    };

    sock.ev.on("connection.update", async (up) => {
        const { connection } = up;
        
        // Si la conexión empieza a establecerse, pedimos el código
        if (connection === "connecting") {
            // Solo lo pedimos si no hay credenciales registradas
            if (!sock.authState.creds.registered) {
                await pedirCodigo();
            }
        }

        if (connection === "open") console.log("\n✅ ¡CONECTADO EXITOSAMENTE!");
        if (connection === "close") startShadow();
    });

    sock.ev.on("creds.update", saveCreds);
}
startShadow().catch(console.error);
