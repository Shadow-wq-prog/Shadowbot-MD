const { Client, LocalAuth } = require('whatsapp-web.js');
const chalk = require('chalk');
const gradient = require('gradient-string');
const readline = require('readline');
const config = require('../config/config');
const logger = require('./utils/logger');
const { loadCommands } = require('./handlers/commandHandler');
const { handleMessage } = require('./handlers/messageHandler');
const { handleGroupUpdate } = require('./handlers/groupHandler');

// ─── Degradados ────────────────────────────────────────────────────────────────
const fuego = gradient(['#ff0000', '#ff4500', '#ff8c00', '#ffd700']);
const oceano = gradient(['#00bfff', '#0080ff', '#0000cd', '#00ced1']);
const fuegoOceano = gradient([
  '#ff4500', '#ff8c00', '#ffd700',
  '#00ced1', '#0080ff', '#0000cd',
]);

// ─── Animación del banner ──────────────────────────────────────────────────────
async function mostrarBanner() {
  const nombre = 'S\u03b7\u03b1d\u03bf\u03c9\u03b2\u03bf\u03c4';  // Sηαdοωβοτ
  const frames = [
    gradient(['#ff4500', '#ff8c00', '#ffd700', '#00ced1', '#0080ff', '#0000cd']),
    gradient(['#ff8c00', '#ffd700', '#00ced1', '#0080ff', '#0000cd', '#ff4500']),
    gradient(['#ffd700', '#00ced1', '#0080ff', '#0000cd', '#ff4500', '#ff8c00']),
    gradient(['#00ced1', '#0080ff', '#0000cd', '#ff4500', '#ff8c00', '#ffd700']),
    gradient(['#0080ff', '#0000cd', '#ff4500', '#ff8c00', '#ffd700', '#00ced1']),
    gradient(['#0000cd', '#ff4500', '#ff8c00', '#ffd700', '#00ced1', '#0080ff']),
  ];

  const lineas = [
    '                                          ',
    '  ░██████╗██╗  ██╗ █████╗ ██████╗  ██████╗ ██╗    ██╗██████╗  ██████╗ ████████╗  ',
    '  ██╔════╝██║  ██║██╔══██╗██╔══██╗██╔═══██╗██║    ██║██╔══██╗██╔═══██╗╚══██╔══╝  ',
    '  ╚█████╗ ███████║███████║██║  ██║██║   ██║██║ █╗ ██║██████╔╝██║   ██║   ██║     ',
    '   ╚═══██╗██╔══██║██╔══██║██║  ██║██║   ██║██║███╗██║██╔══██╗██║   ██║   ██║     ',
    '  ██████╔╝██║  ██║██║  ██║██████╔╝╚██████╔╝╚███╔███╔╝██████╔╝╚██████╔╝   ██║     ',
    '  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝  ╚═════╝  ╚══╝╚══╝ ╚═════╝  ╚═════╝   ╚═╝     ',
    '                                          ',
  ];

  process.stdout.write('\x1Bc'); // limpiar terminal

  // Animación: cicla los frames 10 veces
  for (let i = 0; i < 10; i++) {
    const g = frames[i % frames.length];
    process.stdout.write('\x1B[H'); // mover cursor al inicio sin limpiar

    for (const linea of lineas) {
      console.log(g(linea));
    }

    // Nombre estilizado debajo del ASCII
    const nombreGrad = frames[(i + 2) % frames.length];
    console.log(nombreGrad(`            ✦  ${nombre}  ✦`));
    console.log('');

    await new Promise((r) => setTimeout(r, 120));
  }

  // Frame final fijo con degradado fuego→océano
  process.stdout.write('\x1B[H');
  for (const linea of lineas) {
    console.log(fuegoOceano(linea));
  }

  // Subtítulo
  console.log(fuegoOceano(`            ✦  ${nombre}  ✦`));
  console.log('');
  console.log(
    chalk.gray('  ┌────────────────────────────────────────────────────────────┐')
  );
  console.log(
    chalk.gray('  │  ') +
    fuego('🔥 Fuego') +
    chalk.gray('  &  ') +
    oceano('🌊 Océano') +
    chalk.gray('   ·   WhatsApp Bot   ·   ') +
    chalk.white(`v${require('../package.json').version}`) +
    chalk.gray('               │')
  );
  console.log(
    chalk.gray('  └────────────────────────────────────────────────────────────┘')
  );
  console.log('');
}

// ─── Detectar Chromium en Termux ──────────────────────────────────────────────
function detectarChromium() {
  const { execSync } = require('child_process');
  const rutas = [
    '/data/data/com.termux/files/usr/bin/chromium-browser',
    '/data/data/com.termux/files/usr/bin/chromium',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
  ];

  try {
    const resultado = execSync('which chromium-browser || which chromium', {
      encoding: 'utf8',
    }).trim();
    if (resultado) return resultado;
  } catch {}

  const fs = require('fs');
  for (const ruta of rutas) {
    if (fs.existsSync(ruta)) return ruta;
  }

  return null;
}

const rutaChromium = detectarChromium();

// ─── Cliente WhatsApp ──────────────────────────────────────────────────────────
const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: config.bot.sessionPath,
  }),
  puppeteer: {
    headless: true,
    executablePath: rutaChromium,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
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

    console.log(chalk.cyan('  ┌─────────────────────────────────────────┐'));
    console.log(chalk.cyan('  │      🔐  VINCULACIÓN POR CÓDIGO          │'));
    console.log(chalk.cyan('  └─────────────────────────────────────────┘\n'));

    rl.question(
      chalk.yellow('  📱 Ingresa tu número (con código de país, sin + ni espacios)\n') +
      chalk.gray('  Ejemplo: 521234567890\n\n') +
      chalk.white('  > '),
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

// ─── Inicializar ──────────────────────────────────────────────────────────────
async function iniciar() {
  // Mostrar banner animado
  await mostrarBanner();

  // Validar Chromium
  if (!rutaChromium) {
    logger.error('No se encontró Chromium. Instálalo con:');
    console.log(chalk.yellow('\n  pkg install chromium\n'));
    process.exit(1);
  }
  logger.success(`Chromium encontrado en: ${rutaChromium}`);

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
        console.log(fuegoOceano('  ╔══════════════════════════════════════╗'));
        console.log(fuegoOceano('  ║   ✅  CÓDIGO DE VINCULACIÓN          ║'));
        console.log(fuegoOceano('  ╚══════════════════════════════════════╝'));
        console.log('');
        console.log(chalk.gray('  Ve a: WhatsApp → Dispositivos vinculados → Vincular con número'));
        console.log('');
        console.log(
          chalk.white('  🔑 Tu código: ') +
          fuego('██') + ' ' +
          chalk.bold.bgWhite.black(` ${codigoFormateado} `) +
          ' ' + oceano('██')
        );
        console.log('');
        console.log(chalk.gray('  ⏳ El código expira en unos minutos. Ingrésalo rápido.\n'));
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
