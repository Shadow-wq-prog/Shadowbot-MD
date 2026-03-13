import "./settings.js"
import { setTimeout as _setTimeout, setInterval as _setInterval } from 'node:timers';
import handler from './handler.js'
import events from './commands/events.js'
import {
  Browsers,
  makeWASocket,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  jidDecode,
  DisconnectReason,
} from "@whiskeysockets/baileys";
import cfonts from 'cfonts';
import pino from "pino";
import qrcode from "qrcode-terminal";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import readlineSync from "readline-sync";
import boxen from 'boxen';
import { smsg } from "./lib/message.js";
import { startSubBot } from './lib/subs.js';
import { startModBot } from './lib/mods.js';
import { startPremBot } from './lib/prems.js';
import { exec } from "child_process";
import db from "./lib/system/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CONFIGURACIÓN DE LOGS ---
const log = {
  info: (msg) => console.log(chalk.bgBlue.white.bold(`INFO`), chalk.white(msg)),
  success: (msg) => console.log(chalk.bgGreen.white.bold(`SUCCESS`), chalk.greenBright(msg)),
  warn: (msg) => console.log(chalk.bgYellowBright.blueBright.bold(`WARNING`), chalk.yellow(msg)),
  error: (msg) => console.log(chalk.bgRed.white.bold(`ERROR`), chalk.redBright(msg)),
};

const botName = "Sηαdοωβοτ";
const prefix = '|';

// --- INTERFAZ INICIAL ---
console.clear();
cfonts.say('Shadow|Bot', { font: 'block', align: 'center', gradient: ['blue', 'magenta'] });

const DIGITS = (s = "") => String(s).replace(/\D/g, "");
function normalizePhone(input) {
  let s = DIGITS(input);
  if (!s) return "";
  if (s.startsWith("52") && !s.startsWith("521")) s = "521" + s.slice(2);
  return s;
}

let usarCodigo = false;
let numero = "";

// --- SELECCIÓN DE MÉTODO ---
if (!fs.existsSync(`./sessions/creds.json`)) {
  let lineM = '⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ 》';
  console.log(chalk.cyan(`╭${lineM}\n┊ ${chalk.bold.yellow('ELIJA MÉTODO DE CONEXIÓN')}\n┊ 1. QR\n┊ 2. Código de 8 dígitos\n╰${lineM}`));
  const opcion = readlineSync.question(chalk.bold.magentaBright('---> '));
  usarCodigo = (opcion === "2");
  if (usarCodigo) {
    const input = readlineSync.question(chalk.bold.greenBright('\nIngresa tu número (ej: 519XXXXXXXX):\n---> '));
    numero = normalizePhone(input);
  }
}

// --- CARGA DINÁMICA DE PLUGINS ---
const plugins = {};
const loadPlugins = async () => {
  const folder = path.join(__dirname, 'plugins');
  if (!fs.existsSync(folder)) fs.mkdirSync(folder);
  const files = fs.readdirSync(folder).filter(f => f.endsWith('.js'));
  for (const file of files) {
    try {
      const module = await import(`./plugins/${file}?u=${Date.now()}`);
      plugins[file] = module.default;
    } catch (e) { 
      console.log(chalk.red(`❌ Error en plugin: ${file}`)); 
    }
  }
};

async function startShadow() {
  const { state, saveCreds } = await useMultiFileAuthState('./sessions');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
    browser: Browsers.macOS('Chrome'),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
    }
  });

  global.client = sock;

  // --- GENERACIÓN DE CÓDIGO ---
  if (usarCodigo && !sock.authState.creds.registered) {
    _setTimeout(async () => {
      try {
        const pairingCode = await sock.requestPairingCode(numero);
        const code = pairingCode?.match(/.{1,4}/g)?.join("-") || pairingCode;
        console.log(boxen(chalk.bold.white(`TU CÓDIGO:\n\n`) + chalk.bold.bgBlue.white(` ${code} `), {padding: 1, borderColor: 'yellow'}));
      } catch (e) { log.error("Error al generar código."); }
    }, 6000);
  }

  await loadPlugins();

  // --- MANEJO DE MENSAJES ---
  sock.ev.on("messages.upsert", async ({ messages }) => {
    try {
      let m = messages[0];
      if (!m || !m.message || m.key.fromMe) return;

      // Formatear mensaje con smsg para compatibilidad
      try { m = await smsg(sock, m); } catch (e) {}

      const body = m.text || '';
      const from = m.chat;

      // Log de consola (Morado como te gustaba)
      console.log(chalk.magenta(`[ MSJ ] De: ${m.sender.split('@')[0]} | Texto: ${body}`));

      // Lógica de Comandos
      if (body.startsWith(prefix)) {
        const args = body.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();
        
        console.log(chalk.cyan(`[ CMD ] Ejecutando: ${command}`));

        for (const name in plugins) {
          const p = plugins[name];
          if (p && p.command && p.command.includes(command)) {
            await p.run(sock, m, { args, prefix, command });
          }
        }
      }

      // Ejecutar handler y eventos generales (del segundo código)
      if (typeof handler === 'function') handler(sock, m, messages);
      if (typeof events === 'function') await events(sock, m);

    } catch (err) {
      if (!err.message?.includes('data')) log.error(err);
    }
  });

  // --- ACTUALIZACIÓN DE CONEXIÓN ---
  sock.ev.on("connection.update", async (update) => {
    const { qr, connection, lastDisconnect } = update;
    if (qr && !usarCodigo) qrcode.generate(qr, { small: true });

    if (connection === "open") {
      console.log(boxen(chalk.bold(` ✅ ${botName} CONECTADO `), { borderStyle: 'round', borderColor: 'green' }));
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;
      log.warn(`Conexión cerrada. Razón: ${reason}. Reintentando...`);
      startShadow();
    }
  });

  sock.ev.on("creds.update", saveCreds);
}

// --- INICIO DE BASE DE DATOS Y BOT ---
(async () => {
  try {
    if (db && typeof db.loadDatabase === 'function') await db.loadDatabase();
    log.success('Base de datos cargada.');
  } catch (e) { log.error('Error en DB: ' + e); }

  await startShadow();
})();
