const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session_auth');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: state,
        browser: ['Ubuntu', 'Chrome', '20.0.04']
    });

    if (!sock.authState.creds.registered) {
        const phoneNumber = await question('\n[!] Ingresa tu número de WhatsApp (ej: 51900000000):\n> ');
        const code = await sock.requestPairingCode(phoneNumber.trim());
        console.log(`\nTU CÓDIGO DE VINCULACIÓN ES: \x1b[32m${code}\x1b[0m\n`);
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') {
            console.log('\n=== Sηαdοωβοτ ONLINE ===\n');
        } else if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Conexión cerrada, reintentando...', shouldReconnect);
            if (shouldReconnect) setTimeout(() => startBot(), 5000); // Espera 5 seg antes de volver
        }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message) return;
        const from = m.key.remoteJid;
        const body = (m.message.conversation || m.message.extendedTextMessage?.text || '').toLowerCase();

        if (body === '.ping') {
            await sock.sendMessage(from, { text: '¡Pong! 🏓 Sηαdοωβοτ vivo.' });
        }
        if (body === '.menu') {
            await sock.sendMessage(from, { text: '*MENU Sηαdοωβοτ*\n\n.ping\n.menu' });
        }
    });
}

startBot();
