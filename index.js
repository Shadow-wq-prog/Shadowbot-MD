cat <<'EOF' > index.js
import { setTimeout as _setTimeout } from 'node:timers';
import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
  makeCacheableSignalKeyStore
} from "@whiskeysockets/baileys";
import pino from "pino";
import qrcode from "qrcode-terminal";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import readlineSync from "readline-sync";
import boxen from 'boxen';
import cfonts from 'cfonts';
import { exec } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- PERSONALIZACIÓN ---
const botName = "Sηαdοωβοτ";
const ownerName = "Shadow Flash";
const prefix = '|';

const log = {
  info: (msg) => console.log(chalk.bgBlue.white.bold(` INFO `), chalk.white(msg)),
  success: (msg) => console.log(chalk.bgGreen.white.bold(` SUCCESS `), chalk.greenBright(msg)),
  warn: (msg) => console.log(chalk.bgYellowBright.black.bold(` WARNING `), chalk.yellow(msg)),
  error: (msg) => console.log(chalk.bgRed.white.bold(` ERROR `), chalk.redBright(msg)),
};

// --- DISEÑO DE INICIO ---
console.clear();
cfonts.say('Shadow|Bot', {
  font: 'block',
  align: 'center',
  gradient: ['blue', 'magenta']
});

console.log(chalk.bold.rgb(100, 100, 255)(boxen(`Creado por: ${ownerName}\nBot: ${botName}\nEstado: Configurando entorno...`, {padding: 1, margin: 1, borderStyle: 'double', borderColor: 'blue', title: '亗 SYSTEM 亗'})));

// --- MÉTODO DE VINCULACIÓN ---
let usarCodigo = false;
let numero = "";

if (!fs.existsSync(`./sessions/creds.json`)) {
  console.log(chalk.bold.cyan(`╭───────────────────────────────────────────╮`));
  console.log(chalk.bold.cyan(`│`) + chalk.bold.yellow(`       MÉTODO DE VINCULACIÓN SELECCIONADO     `) + chalk.bold.cyan(`│`));
  console.log(chalk.bold.cyan(`├───────────────────────────────────────────┤`));
  console.log(chalk.bold.cyan(`│`) + chalk.white(`  1. Código QR                              `) + chalk.bold.cyan(`│`));
  console.log(chalk.bold.cyan(`│`) + chalk.white(`  2. Código de 8 dígitos (Recomendado)      `) + chalk.bold.cyan(`│`));
  console.log(chalk.bold.cyan(`╰───────────────────────────────────────────╯`));
  
  const opcion = readlineSync.question(chalk.bold.magentaBright('---> Elija una opción: '));
  usarCodigo = (opcion === "2");

  if (usarCodigo) {
    numero = readlineSync.question(chalk.bold.greenBright('\nIngresa tu número de WhatsApp (ej: 519XXXXXXXX):\n---> '));
    numero = numero.replace(/\D/g, "");
  }
}

async function startShadow() {
  const { state, saveCreds } = await useMultiFileAuthState('./sessions');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
    browser: ["Ubuntu", "Chrome", "20.0.04"],
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
    }
  });

  // --- SOLICITAR CÓDIGO SI ES NECESARIO ---
  if (usarCodigo && !sock.authState.creds.registered) {
    _setTimeout(async () => {
      try {
        const pairingCode = await sock.requestPairingCode(numero);
        const codeDisplay = pairingCode?.match(/.{1,4}/g)?.join("-") || pairingCode;
        console.log(boxen(chalk.bold.white(`TU CÓDIGO DE VINCULACIÓN:\n\n`) + chalk.bold.bgBlue.white(` ${codeDisplay} `), {padding: 1, borderColor: 'yellow', borderStyle: 'round'}));
      } catch (e) {
        log.error("Error al solicitar código: " + e.message);
      }
    }, 3000);
  }

  // --- CARGADOR DE PLUGINS ---
  const plugins = {};
  const loadPlugins = async () => {
    const folder = path.join(__dirname, 'plugins');
    if (!fs.existsSync(folder)) fs.mkdirSync(folder);
    const files = fs.readdirSync(folder).filter(f => f.endsWith('.js'));
    for (const file of files) {
      try {
        const module = await import(`./plugins/${file}?u=${Date.now()}`);
        plugins[file] = module.default;
      } catch (e) { log.error(`Error en plugin ${file}: ${e.message}`); }
    }
    log.success(`${Object.keys(plugins).length} Plugins cargados correctamente.`);
  };
  await loadPlugins();

  // --- MANEJO DE MENSAJES ---
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages
