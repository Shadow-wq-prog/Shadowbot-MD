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
    const { state, saveCreds } = await useMultiFileAuthState('./sessions');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false, // Usaremos la librería manual para que no falle
        auth: state,
        browser: ['Sηαdοωβοτ', 'Chrome', '1.0.0']
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        // DIBUJAR EL QR SÍ O SÍ
        if (qr) {
            console.clear();
            console.log('╔════════════════════════════════════╗');
            console.log('║   📱 ESCANEA EL QR CON PREFIJO [ | ] ║');
            console.log('╚════════════════════════════════════╝');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startShadow();
        } else if (connection === 'open') {
            console.log('✅ Sηαdοωβοτ ONLINE - Prefijo: |');
        }
    });

    // LÓGICA DE COMANDOS CON PREFIJO |
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        const m = chatUpdate.messages[0];
        if (!m.message || m.key.fromMe) return;

        const body = m.message.conversation || m.message.extendedTextMessage?.text || '';
        const prefix = '|'; 

        if (body.startsWith(prefix)) {
            const args = body.slice(prefix.length).trim().split(/ +/);
            const command = args.shift().toLowerCase();

            // Comando de prueba rápida
            if (command === 'p' || command === 'ping') {
                await sock.sendMessage(m.key.remoteJid, { text: '⚡ *Sηαdοωβοτ Online con prefijo |*' }, { quoted: m });
            }
        }
    });
}

startShadow();
