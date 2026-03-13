import "./settings.js";
import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, Browsers, jidDecode } from "@whiskeysockets/baileys";
import pino from "pino";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import cfonts from 'cfonts';
import { smsg } from "./lib/message.js";
import db from "./lib/system/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// LOGO GIGANTE
console.clear();
cfonts.say('Shadow|Bot', { font: 'block', align: 'center', gradient: ['blue', 'magenta'] });

global.plugins = {};
async function loadPlugins() {
    const folder = path.join(__dirname, 'plugins');
    const files = fs.readdirSync(folder).filter(f => f.endsWith('.js'));
    for (const file of files) {
        try {
            const module = await import(`./plugins/${file}?u=${Date.now()}`);
            global.plugins[file] = module.default;
        } catch (e) { console.error(`❌ Error en ${file}: ${e.message}`); }
    }
    console.log(chalk.greenBright(`📂 ${Object.keys(global.plugins).length} Plugins cargados correctamente`));
}

async function startShadow() {
  const { state, saveCreds } = await useMultiFileAuthState('./sessions');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    browser: Browsers.ubuntu('Chrome'),
    auth: state
  });

  sock.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {};
      return decode.user && decode.server && decode.user + '@' + decode.server || jid;
    } else return jid;
  };

  sock.ev.on('messages.upsert', async chatUpdate => {
    try {
      let m = chatUpdate.messages[0];
      if (!m || !m.message) return;
      let msg = smsg(sock, m, sock);
      const handler = (await import('./handler.js')).default;
      await handler(sock, msg, chatUpdate);
    } catch (e) { }
  });

  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', (update) => {
    const { connection } = update;
    if (connection === 'open') console.log(chalk.greenBright("✅ Sηαdοωβοτ CONECTADO"));
    if (connection === 'close') startShadow();
  });
}

// Cargar todo en orden
(async () => {
    await global.loadDatabase();
    await loadPlugins();
    await startShadow();
})();
