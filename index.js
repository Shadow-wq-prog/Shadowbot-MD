import "./settings.js";
import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, Browsers, jidDecode } from "@whiskeysockets/baileys";
import pino from "pino";
import chalk from "chalk";
import fs from "fs";
import { smsg } from "./lib/message.js";
import db from "./lib/system/database.js";

async function startShadow() {
  const { state, saveCreds } = await useMultiFileAuthState('./sessions');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    printQRInTerminal: true,
    browser: Browsers.ubuntu('Chrome'),
    auth: state
  });

  // Injectar decodeJid para que lib/message no falle
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
    } catch (e) {
      if (!e.message.includes('split')) console.error(e);
    }
  });

  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', (update) => {
    const { connection } = update;
    if (connection === 'open') console.log(chalk.greenBright("✅ Sηαdοωβοτ CONECTADO"));
    if (connection === 'close') startShadow();
  });
}

// Iniciar base de datos y luego el bot
global.loadDatabase().then(() => {
  console.log(chalk.blueBright("📦 Base de datos cargada"));
  startShadow();
}).catch(console.error);
