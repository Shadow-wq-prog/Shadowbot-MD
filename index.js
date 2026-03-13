import { 
    makeWASocket, 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion 
} from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import path from 'path';

async function startShadow() {
    const { state, saveCreds } = await useMultiFileAuthState('./sessions');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        printQRInTerminal: true,
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: ['Sηαdοωβοτ', 'Chrome', '1.0.0']
    });

    sock.ev.on('creds.update', saveCreds);

    // --- MANEJO DE MENSAJES ---
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        const m = chatUpdate.messages[0];
        if (!m.message || m.key.fromMe) return;

        // Captura el texto del mensaje
        const body = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || '';
        
        // EL PREFIJO QUE ELEGISTE
        const prefix = '|'; 

        // Si el mensaje empieza con el prefijo
        if (body.startsWith(prefix)) {
            const args = body.slice(prefix.length).trim().split(/ +/);
            const command = args.shift().toLowerCase();

            console.log(`🚀 Comando detectado: ${command} con prefijo ${prefix}`);

            // --- LÓGICA DE PRUEBA RÁPIDA ---
            if (command === 'p' || command === 'ping') {
                await sock.sendMessage(m.key.remoteJid, { text: '✨ *¡Sηαdοωβοτ Online!* ⚡' }, { quoted: m });
            }

            // Aquí el bot buscará en tu carpeta plugins automáticamente
            const pluginsFolder = './plugins';
            const files = fs.readdirSync(pluginsFolder);
            for (const file of files) {
                if (file.endsWith('.js')) {
                    const plugin = await import(`./plugins/${file}?u=${Date.now()}`);
                    if (plugin.default.command?.includes(command)) {
                        await plugin.default.run(sock, m, args);
                    }
                }
            }
        }
    });

    sock.ev.on('connection.update', (update) => {
        const { connection } = update;
        if (connection === 'open') console.log('✅ Sηαdοωβοτ conectado con prefijo [ | ]');
    });
}

startShadow();
