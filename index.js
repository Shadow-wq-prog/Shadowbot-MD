cat <<'EOF' > index.js
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
        const code = await sock.requestPairingCode(num);
        console.log('\n🔑 TU CÓDIGO ES:', code, '\n');
    }

    sock.ev.on("connection.update", (up) => {
        const { connection } = up;
        if (connection === "open") console.log("\n✅ ¡CONECTADO EXITOSAMENTE!");
        if (connection === "close") startShadow();
    });

    sock.ev.on("creds.update", saveCreds);
}
startShadow().catch(console.error);
EOF