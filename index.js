cat <<'EOF' > index.js
import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, delay } from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function startShadow() {
    const { state, saveCreds } = await useMultiFileAuthState('./sessions');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        auth: state,
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        printQRInTerminal: false // Desactivamos QR para usar Pairing Code
    });

    // LÓGICA DE VINCULACIÓN POR CÓDIGO
    if (!sock.authState.creds.registered) {
        console.clear();
        console.log('亗 Sηαdοωβοτ - VINCULACIÓN POR CÓDIGO 亗');
        const phoneNumber = await question('📝 Ingresa tu número de WhatsApp (ej: 519XXXXXXXX): ');
        const code = await sock.requestPairingCode(phoneNumber.trim());
        console.log(`\n🔑 TU CÓDIGO DE VINCULACIÓN ES: ${code}\n`);
    }

    // CARGADOR DE PLUGINS
    const plugins = {};
    const loadPlugins = async () => {
        const folder = path.join(__dirname, 'plugins');
        if (!fs.existsSync(folder)) fs.mkdirSync(folder);
        const files = fs.readdirSync(folder).filter(f => f.endsWith('.js'));
        for (const file of files) {
            try {
                const module = await import(`./plugins/${file}?u=${Date.now()}`);
                plugins[file] = module.default;
            } catch (e) { console.log(`❌ Error en plugin ${file}: ${e.message}`); }
        }
        console.log(`✨ Plugins cargados: ${Object.keys(plugins).length}`);
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
            
            // LOG EN CONSOLA
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
        if (up.connection === 'open') console.log('✅ BOT CONECTADO');
        if (up.connection === 'close') startShadow();
    });

    sock.ev.on('creds.update', saveCreds);
}
startShadow();
EOF
