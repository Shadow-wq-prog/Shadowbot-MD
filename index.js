const { Client, LocalAuth } = require('whatsapp-web.js');
const chalk = require('chalk');
const readline = require('readline');
const config = require('../config/config');
const logger = require('./utils/logger');
const { loadCommands } = require('./handlers/commandHandler');
const { handleMessage } = require('./handlers/messageHandler');
const { handleGroupUpdate } = require('./handlers/groupHandler');

// ─── Banner ────────────────────────────────────────────────────────────────────
console.log(
  chalk.bold.black.bgWhite(
    `\n  🌑  ${config.bot.name.toUpperCase()}  |  WhatsApp Bot  \n`
  )
);
console.log(chalk.gray('  Iniciando...\n'));

// ─── Cargar Comandos ───────────────────────────────────────────────────────────
loadCommands();

// ─── Detectar ruta de Chromium en Termux ──────────────────────────────────────
function detectarChromium() {
  const { execSync } = require('child_process');
  const rutas = [
    '/data/data/com.termux/files/usr/bin/chromium-browser',
    '/data/data/com.termux/files/usr/bin/chromium',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
  ];

  // Intentar encontrarlo con "which"
  try {
    const resultado = execSync('which chromium-browser || which chromium', {
      encoding: 'utf8',
    }).trim();
    if (resultado) return resultado;
  } catch {}

  // Buscar en rutas conocidas
  const fs = require('fs');
  for (const ruta of rutas) {
    if (fs.existsSync(ruta)) return ruta;
  }

  return null;
}

const rutaChromium = detectarChromium();

if (rutaChromium) {
  logger.success(`Chromium encontrado en: ${rutaChromium}`);
} else {
  logger.warn('No se encontró Chromium. Instálalo con:');
  console.log(chalk.yellow('\n  pkg install chromium\n'));
  process.exit(1);
}

// ─── Cliente WhatsApp (sin descargar Chromium, usa el del sistema) ─────────────
const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: config.bot.sessionPath,
  }),
  puppeteer: {
    headless: true,
    executablePath: rutaChromium,   // 👈 usa el Chromium de Termux
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',           // 👈 importante en Termux (sin zygote)
      '--disable-gpu',
      '--disable-extensions',
      '--disable-software-rasterizer',
    ],
  },
});

// ─── Pedir número por terminal ─────────────────────────────────────────────────
function pedirNumero() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log(chalk.cyan('\n┌─────────────────────────────────────────┐'));
    console.log(chalk.cyan('│      🔐  VINCULACIÓN POR CÓDIGO          │'));
    console.log(chalk.cyan('└─────────────────────────────────────────┘\n'));

    rl.question(
      chalk.yellow('  📱 Ingresa tu número (con código de país, sin + ni espacios)\n  Ejemplo: 521234567890\n\n  > '),
      (numero) => {
        rl.close();
        const limpio = numero.trim().replace(/[+\-\s]/g, '');
        resolve(limpio);
      }
    );
  });
}

// ─── Eventos ──────────────────────────────────────────────────────────────────
client.on('ready', async () => {
  const info = client.info;
  console.log('');
  logger.success(`¡Bot listo! Conectado como ${info.pushname} (+${info.wid.user})`);
  logger.info(`Prefijo: ${config.bot.prefix} | Anti-spam: ${config.features.antiSpam}`);
});

client.on('qr', () => {
  logger.warn('Se recibió un QR inesperado. Reinicia el bot e intenta de nuevo.');
});

client.on('authenticated', () => {
  logger.success('¡Autenticación exitosa! Sesión guardada.');
});

client.on('auth_failure', (msg) => {
  logger.error(`Error de autenticación: ${msg}`);
  process.exit(1);
});

client.on('disconnected', (reason) => {
  logger.warn(`Cliente desconectado: ${reason}`);
});

client.on('message', (msg) => handleMessage(client, msg));
client.on('group_join', (notification) => handleGroupUpdate(client, notification));
client.on('group_leave', (notification) => handleGroupUpdate(client, notification));

process.on('unhandledRejection', (err) => {
  logger.error(`Promesa rechazada sin manejar: ${err.message}`);
});
process.on('uncaughtException', (err) => {
  logger.error(`Excepción no capturada: ${err.message}`);
});

// ─── Inicializar con Pairing Code ─────────────────────────────────────────────
async function iniciar() {
  const fs = require('fs');
  const sessionExiste = fs.existsSync(`${config.bot.sessionPath}/session`);

  if (!sessionExiste) {
    const numero = await pedirNumero();

    if (!numero || numero.length < 8) {
      logger.error('Número inválido. Por favor ingresa un número válido con código de país.');
      process.exit(1);
    }

    logger.info(`Número ingresado: +${numero}`);
    logger.info('Iniciando cliente, espera un momento...\n');

    client.on('pre_auth_code', async () => {
      try {
        logger.info('Solicitando código de vinculación...');
        const codigo = await client.requestPairingCode(numero);
        const codigoFormateado = codigo.match(/.{1,4}/g).join('-');

        console.log('');
        console.log(chalk.bold.bgGreen.black('  ✅ CÓDIGO DE VINCULACIÓN OBTENIDO  '));
        console.log('');
        console.log(chalk.white('  Ve a WhatsApp → Dispositivos vinculados → Vincular con número'));
        console.log('');
        console.log(chalk.bold.yellow(`  🔑 Tu código: `) + chalk.bold.bgWhite.black(` ${codigoFormateado} `));
        console.log('');
        console.log(chalk.gray('  El código expira en unos minutos. Ingrésalo rápido.\n'));
      } catch (err) {
        logger.error(`No se pudo obtener el código: ${err.message}`);
        logger.warn('Asegúrate de que el número es correcto y tiene WhatsApp activo.');
        process.exit(1);
      }
    });

  } else {
    logger.info('Sesión existente encontrada. Conectando sin pedir código...\n');
  }

  client.initialize();
}

iniciar();
