import { 
    makeWASocket, 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion 
} from '@whiskeysockets/baileys';
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
        printQRInTerminal: true,
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: ['Sηαdοωβοτ', 'Safari', '1.0.0']
    });

    sock.ev.on('creds.update', saveCreds);

    // --- CARGADOR DE PLUGINS ---
    const pluginsFolder = path.join(__dirname, 'plugins');
    const plugins = {};

    const loadPlugins = async () => {
        const files = fs.readdirSync(pluginsFolder);
        for (const file of files) {
            if (file.endsWith('.js')) {
                const pluginPath = `./plugins/${file}`;
                const plugin = await import(`${pluginPath}?update=${Date.now()}`);
                plugins[file] = plugin.default;
            }
        }
        console.log(`✅ ${Object.keys(plugins).length} Plugins cargados.`);
    };

    await loadPlugins();

    // --- MANEJO DE MENSAJES ---
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        const m = chatUpdate.messages[0];
        if (!m.message || m.key.fromMe) return;

        const messageContent = m.message.conversation || m.message.extendedTextMessage?.text || '';
        
        // DEFINIR PREFIJO
        const prefix = '|'; 
        
        if (!messageContent.startsWith(prefix)) return;

        const args = messageContent.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        // BUSCAR Y EJECUTAR COMANDO
        for (const filename in plugins) {
            const plugin = plugins[filename];
            if (plugin.command && (plugin.command.includes(commandName))) {
                try {
                    await plugin.run(sock, m, args);
                } catch (err) {
                    console.error(`Error en comando ${commandName}:`, err);
                }
            }
        }
    });

    sock.ev.on('connection.update', (update) => {
        const { connection } = update;
        if (connection === 'open') console.log('✅ Sηαdοωβοτ ONLINE con prefijo [ | ]');
    });
}

startShadow();
