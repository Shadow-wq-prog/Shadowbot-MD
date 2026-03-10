const { default: makeWASocket, useMultiFileAuthState, delay, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
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
        printQRInTerminal: false, // Desactivamos el QR
        auth: state,
        browser: ['Ubuntu', 'Chrome', '20.0.04']
    });

    // --- LÓGICA PARA CÓDIGO DE 8 DÍGITOS ---
    if (!sock.authState.creds.registered) {
        const phoneNumber = await question('\n[!] Ingresa tu número de WhatsApp (ej: 51900000000):\n> ');
        const code = await sock.requestPairingCode(phoneNumber.trim());
        console.log(`\nTU CÓDIGO DE VINCULACIÓN ES: \x1b[32m${code}\x1b[0m\n`);
        console.log('Pon este código en: Dispositivos vinculados > Vincular con número de teléfono\n');
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection } = update;
        if (connection === 'open') {
            console.log('\n=== Sηαdοωβοτ ONLINE CON ÉXITO ===\n');
        } else if (connection === 'close') {
            startBot();
        }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message || m.key.fromMe) return;
        const body = m.message.conversation || m.message.extendedTextMessage?.text;
        if (body === '.ping') {
            await sock.sendMessage(m.key.remoteJid, { text: '¡Pong! 🏓 Sηαdοωβοτ vivo.' });
        }
    });
}

console.log('--- INICIANDO SISTEMA DE DÍGITOS ---');
startBot();
        
