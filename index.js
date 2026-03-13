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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const botName = "Sηαdοωβοτ";
const ownerName = "Shadow Flash";
const prefix = '|';

console.clear();
cfonts.say('Shadow|Bot', {
  font: 'block',
  align: 'center',
  gradient: ['blue', 'magenta']
});

let usarCodigo = false;
let numero = "";

if (!fs.existsSync(`./sessions/creds.json`)) {
  console.log(chalk.bold.cyan(`╭───────────────────────────────────────────╮`));
  console.log(chalk.bold.cyan(`│`) + chalk.bold.yellow(`       MÉTODO DE VINCULACIÓN SELECCIONADO     `) + chalk.bold.cyan(`│`));
  console.log(chalk.bold.cyan(`╰───────────────────────────────────────────╯`));
  const opcion = readlineSync.question(chalk.bold.magentaBright('---> Elija 1 (QR) o 2 (Código): '));
  usarCodigo = (opcion === "2");
  if (usarCodigo) {
    numero = readlineSync.question(chalk.bold.greenBright('\nIngresa tu número (ej: 519XXXXXXXX):\n---> ')).replace(/\D/g, "");
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

  if (usarCodigo && !sock.authState.creds.registered) {
    _setTimeout(async () => {
      try {
        const pairingCode = await sock.requestPairingCode(numero);
        console.log(boxen(chalk.bold.white(`TU CÓDIGO:\n\n`) + chalk.bold.bgBlue.white(` ${pairingCode} `), {padding: 1, borderColor: 'yellow'}));
      } catch (e) { console.log("Error al generar código."); }
    }, 3000);
  }

  const plugins = {};
  const loadPlugins = async () => {
    const folder = path.join(__dirname, 'plugins');
    if (!fs.existsSync(folder)) fs.mkdirSync(folder);
    const files = fs.readdirSync(folder).filter(f => f.endsWith('.js') || f.endsWith('.cjs'));
    for (const file of files) {
      try {
        const module = await import(`./plugins/${file}?u=${Date.now()}`);
        plugins[file] = module.default;
      } catch (e) { console.log(`Error en plugin ${file}`); }
    }
  };
  await loadPlugins();

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0];
    if (!m || !m.message || m.key.fromMe) return;
    const body = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || '';
    if (body.startsWith(prefix)) {
      const args = body.slice(prefix.length).trim().split(/ +/);
      const command = args.shift().toLowerCase();
      for (const name in plugins) {
        const p = plugins[name];
        if (p.command?.includes(command)) {
          try { await p.run(sock, m, { args, prefix, command }); } catch (err) { console.error(err); }
        }
      }
    }
  });

  sock.ev.on("connection.update", (update) => {
    const { qr, connection } = update;
    if (qr && !usarCodigo) qrcode.generate(qr, { small: true });
    if (connection === "open") console.log(chalk.bold.green(`\n✅ ${botName} ONLINE`));
    if (connection === "close") startShadow();
  });

  sock.ev.on("creds.update", saveCreds);
}
startShadow();
EOF