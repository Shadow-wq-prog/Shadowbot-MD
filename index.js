cat <<'EOF' > index.js
import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode-terminal';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startShadow() {
    const { state, saveCreds } = await useMultiFileAuthState('./sessions');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: state,
        browser: ['ShadowBot', 'Chrome', '1.0.0']
    });

    const plugins = {};
    const loadPlugins = async () => {
        const folder = path.join(__dirname, 'plugins');
        if (!fs.existsSync(folder)) fs.mkdirSync(folder);
        const files = fs.readdirSync(folder).filter(file => file.endsWith('.js'));
        for (const file of files) {
            try {
                const pluginPath = `./plugins/${file}`;
                const module = await import(`${pluginPath}?u=${Date.now()}`);
                plugins[file] = module.default;
            } catch (e) { console.log(`❌ Error en ${file}: ${e.message}`); }
        }
        console.log(`✨ [ShadowBot] ${Object.keys(plugins).length} Plugins cargados.`);
    };

    await loadPlugins();

    sock.ev.on('messages.upsert', async (chatUpdate) => {
        const m = chatUpdate.messages[0];
        if (!m.message || m.key.fromMe) return;
        const body = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || '';
        const prefix = '|'; 
        if (body.startsWith(prefix)) {
            const args = body.slice(prefix.length).trim().split(/ +/);
            const command = args.shift().toLowerCase();
            console.log(`━━━━━━━━━━━━━━━━━━━━\n👤 DE: ${m.pushName}\n💻 CMD: ${prefix}${command}\n━━━━━━━━━━━━━━━━━━━━`);
            for (const name in plugins) {
                const p = plugins[name];
                if (p.command?.includes(command)) {
                    try { await p.run(sock, m, { args, prefix, command }); } catch (err) { console.error(err); }
                }
            }
        }
    });

    sock.ev.on('connection.update', (up) => {
        const { connection, lastDisconnect, qr } = up;
        if (qr) { console.clear(); qrcode.generate(qr, { small: true }); }
        if (connection === 'open') console.log('✅ BOT ONLINE');
        if (connection === 'close') {
            let reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) startShadow();
        }
    });
    sock.ev.on('creds.update', saveCreds);
}
startShadow();
EOF
