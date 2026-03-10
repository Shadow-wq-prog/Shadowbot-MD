const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const path = require('path');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session_auth');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        auth: state,
        browser: ['Ubuntu', 'Chrome', '20.0.04']
    });

    // --- CARGADOR DE PLUGINS ---
    const plugins = {};
    const pluginsFolder = path.join(__dirname, 'plugins');
    if (!fs.existsSync(pluginsFolder)) fs.mkdirSync(pluginsFolder);

    const pluginFiles = fs.readdirSync(pluginsFolder).filter(file => file.endsWith('.js'));
    for (const file of pluginFiles) {
        const plugin = require(path.join(pluginsFolder, file));
        plugins[file] = plugin;
    }
    console.log(`[!] ${pluginFiles.length} Plugins cargados con éxito.`);

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message) return;
        const from = m.key.remoteJid;
        const body = (m.message.conversation || m.message.extendedTextMessage?.text || '').toLowerCase();
        const prefix = '.';

        if (!body.startsWith(prefix)) return;
        const command = body.slice(prefix.length).trim().split(' ').shift();
        const args = body.trim().split(/ +/).slice(1);

        // Ejecutar el plugin si existe
        for (const file in plugins) {
            if (plugins[file].command.includes(command)) {
                await plugins[file].run(sock, m, from, args);
            }
        }
    });

    sock.ev.on('connection.update', (up) => { if (up.connection === 'open') console.log('=== Sηαdοωβοτ ONLINE ==='); });
}

startBot();
