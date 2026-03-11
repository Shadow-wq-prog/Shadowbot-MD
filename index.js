import { 
    makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion 
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import fs from 'fs';
import path from 'path';

async function startShadowBot() {
    // 📂 Carpeta donde se guarda la sesión (QR)
    const sessionDir = './sessions';
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir);

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        printQRInTerminal: true, // ✅ ESTO ACTIVA EL CÓDIGO QR
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: ['Sηαdοωβοτ', 'Safari', '1.0.0']
    });

    // 🔄 Manejo de la conexión
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('📢 ESCANEA EL CÓDIGO QR PARA CONECTAR Sηαdοωβοτ');
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('⚠️ Conexión cerrada. ¿Reconectando?', shouldReconnect);
            if (shouldReconnect) startShadowBot();
        } else if (connection === 'open') {
            console.log('✅ Sηαdοωβοτ ONLINE - Vinculación Exitosa');
        }
    });

    // 💾 Guardar credenciales automáticamente
    sock.ev.on('creds.update', saveCreds);

    // 📥 Manejo de mensajes (Cargador de Plugins)
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const m = chatUpdate.messages[0];
            if (!m.message) return;
            
            // Aquí es donde tus plugins entran en acción
            // Puedes añadir tu lógica de comandos aquí o importar tu cargador
            const body = m.message.conversation || m.message.extendedTextMessage?.text;
            if (body) console.log(`📩 Mensaje recibido: ${body}`);
            
        } catch (err) {
            console.error('❌ Error en el procesador de mensajes:', err);
        }
    });
}

// 🚀 Arrancar el bot
startShadowBot();
