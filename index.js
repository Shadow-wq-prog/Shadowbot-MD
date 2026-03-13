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
        browser: ['Sηαdοωβοτ', 'Chrome', '1.0.0']
    });

    // --- CARGADOR DE PLUGINS ---
    const plugins = {};
    const loadPlugins = async () => {
        const pluginsFolder = path.join(__dirname, 'plugins');
        if (!fs.existsSync(pluginsFolder)) fs.mkdirSync(pluginsFolder);
        
        const files = fs.readdirSync(pluginsFolder);
        for (const file of files) {
            if (file.endsWith('.js')) {
                try {
                    const pluginPath = `./plugins/${file}`;
                    const plugin = await import(`${pluginPath}?update=${Date.now()}`);
                    plugins[file] = plugin.default;
                } catch (e) {
                    console.error(`❌ Error cargando plugin ${file}:`, e);
                }
            }
        }
        console.log(`✨ [Sηαdοωβοτ] ${Object.keys(plugins).length} Plugins cargados correctamente.`);
    };

    await loadPlugins();

    // --- MANEJO DE MENSAJES & CONSOLA ---
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        const m = chatUpdate.messages[0];
        if (!m.message || m.key.fromMe) return;

        const sender = m.key.remoteJid;
        const pushName = m.pushName || 'Usuario';
        const body = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || '';
        
        const prefix = '|'; 

        // 📝 LOG EN CONSOLA: Quién pone comandos
        if (body.startsWith(prefix)) {
            const args = body.slice(prefix.length).trim().split(/ +/);
            const command = args.shift().toLowerCase();

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`👤 USUARIO: ${pushName} (${sender.split('@')[0]})`);
            console.log(`💻 COMANDO: ${prefix}${command}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // EJECUCIÓN DE PLUGINS
            let matched = false;
            for (const name in plugins) {
                const p = plugins[name];
                if (p.command?.includes(command)) {
                    matched = true;
                    try {
                        await p.run(sock, m, { args, prefix, command });
                    } catch (err) {
                        console.error(`❌ Error en plugin ${name}:`, err);
                    }
                }
            }
            
            // Respuesta rápida de ping si no hay plugin para prueba
            if (!matched && (command === 'p' || command === 'ping')) {
                await sock.sendMessage(sender, { text: '⚡ *Sηαdοωβοτ Online*' }, { quoted: m });
            }
        }
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            console.clear();
            qrcode.generate(qr, { small: true });
            console.log('📢 Escanea el QR para activar el prefijo [ | ]');
        }
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startShadow();
        } else if (connection === 'open') {
            console.log('✅ Sηαdοωβοτ CONECTADO');
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

startShadow();
