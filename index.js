const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
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

    // --- SISTEMA DE 8 DÍGITOS ---
    if (!sock.authState.creds.registered) {
        const phoneNumber = await question('\n[!] Ingresa tu número de WhatsApp (ej: 51900000000):\n> ');
        const code = await sock.requestPairingCode(phoneNumber.trim());
        console.log(`\nTU CÓDIGO DE VINCULACIÓN ES: \x1b[32m${code}\x1b[0m\n`);
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection } = update;
        if (connection === 'open') {
            console.log('\n=== Sηαdοωβοτ ONLINE ===\n');
        } else if (connection === 'close') {
            startBot();
        }
    });

    // --- MANEJADOR DE MENSAJES (SEPARADO) ---
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message) return;

        const from = m.key.remoteJid;
        const body = m.message.conversation || m.message.extendedTextMessage?.text || '';
        const budy = body.toLowerCase(); // Para que no importe si escribes en mayúsculas

        // --- COMANDO: PING ---
        if (budy === '.ping') {
            await sock.sendMessage(from, { text: '¡Pong! 🏓 Sηαdοωβοτ está activo.' });
        }

        // --- COMANDO: MENU ---
        if (budy === '.menu') {
            const menuText = `
*╭──────────────*
*│  ✨ Sηαdοωβοτ ✨*
*╰──────────────*
*│* 👤 *User:* @${from.split('@')[0]}
*│* 🛠️ *Prefix:* [ . ]
*╰──────────────*

*──「 COMANDOS 」──*
*◈ .ping* (Prueba)
*◈ .menu* (Lista)
*◈ .owner* (Creador)

_Usa los comandos con el punto al inicio._
            `;
            await sock.sendMessage(from, { text: menuText.trim(), mentions: [from] });
        }

        // --- COMANDO: OWNER ---
        if (budy === '.owner') {
            await sock.sendMessage(from, { text: 'El creador de este bot es Fernando. 😎' });
        }
    });
}

console.log('--- CARGANDO Sηαdοωβοτ ---');
startBot();

        
