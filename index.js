import { 
    makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion 
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode-terminal';
import pino from 'pino';
import fs from 'fs';

async function startShadow() {
    // 📂 Carpeta de sesión limpia
    const { state, saveCreds } = await useMultiFileAuthState('./sessions');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false, // Lo ponemos en false para usar la librería manual
        auth: state,
        browser: ['Sηαdοωβοτ', 'Chrome', '1.0.0']
    });

    // 🔄 Manejo de conexión y generación de QR
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        // --- AQUÍ SE GENERA EL QR ---
        if (qr) {
            console.clear();
            console.log('╔════════════════════════════════════╗');
            console.log('║   📱 ESCANEA EL QR DE Sηαdοωβοτ   ║');
            console.log('╚════════════════════════════════════╝');
            qrcode.generate(qr, { small: true }); // Dibuja el QR en formato pequeño
            console.log('💡 Tip: Aleja el zoom de Termux si se ve mal.');
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startShadow();
        } else if (connection === 'open') {
            console.log('✅ Sηαdοωβοτ CONECTADO CON ÉXITO');
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // Cargador básico de mensajes para que no dé error
    sock.ev.on('messages.upsert', async (m) => {
        // Tu lógica de plugins aquí
    });
}

startShadow().catch(err => console.error("Error global:", err));
