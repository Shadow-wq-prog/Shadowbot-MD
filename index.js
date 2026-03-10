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

// ─── Cliente WhatsApp ──────────────────────────────────────────────────────────
const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: config.bot.sessionPath,
  }),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
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
        // Limpiar el número: quitar +, espacios y guiones
        const limpio = numero.trim().replace(/[+\-\s]/g, '');
        resolve(limpio);
      }
    );
  });
}

// ─── Evento: listo para vincular ──────────────────────────────────────────────
client.on('ready', async () => {
  const info = client.info;
  console.log('');
  logger.success(`¡Bot listo! Conectado como ${info.pushname} (+${info.wid.user})`);
  logger.info(`Prefijo: ${config.bot.prefix} | Anti-spam: ${config.features.antiSpam}`);
});

// ─── Evento: QR (fallback, no debería llegar aquí) ────────────────────────────
client.on('qr', () => {
  logger.warn('Se recibió un QR inesperado. Reinicia el bot e intenta de nuevo.');
});

// ─── Evento: autenticado ──────────────────────────────────────────────────────
client.on('authenticated', () => {
  logger.success('¡Autenticación exitosa! Sesión guardada.');
});

client.on('auth_failure', (msg) => {
  logger.error(`Error de autenticación: ${msg}`);
  process.exit(1);
});

// ─── Evento: desconectado ─────────────────────────────────────────────────────
client.on('disconnected', (reason) => {
  logger.warn(`Cliente desconectado: ${reason}`);
});

// ─── Mensajes y Grupos ────────────────────────────────────────────────────────
client.on('message', (msg) => handleMessage(client, msg));
client.on('group_join', (notification) => handleGroupUpdate(client, notification));
client.on('group_leave', (notification) => handleGroupUpdate(client, notification));

// ─── Errores globales ─────────────────────────────────────────────────────────
process.on('unhandledRejection', (err) => {
  logger.error(`Promesa rechazada sin manejar: ${err.message}`);
});
process.on('uncaughtException', (err) => {
  logger.error(`Excepción no capturada: ${err.message}`);
});

// ─── Inicializar con Pairing Code ─────────────────────────────────────────────
async function iniciar() {
  // Solo pedir número si no hay sesión guardada
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

    // Escuchar el evento pre_auth_code para solicitar el pairing code
    client.on('pre_auth_code', async () => {
      try {
        logger.info('Solicitando código de vinculación...');
        const codigo = await client.requestPairingCode(numero);

        // Formatear el código en grupos de 4: XXXX-XXXX
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
```

---

### 🔍 ¿Qué cambió y cómo funciona?

**Flujo completo en Termux:**
```
🌑  SHADOWBOT  |  WhatsApp Bot

┌─────────────────────────────────────────┐
│      🔐  VINCULACIÓN POR CÓDIGO          │
└─────────────────────────────────────────┘

  📱 Ingresa tu número (con código de país, sin + ni espacios)
  Ejemplo: 521234567890

  > 521234567890

[INFO]  Iniciando cliente, espera un momento...
[INFO]  Solicitando código de vinculación...

  ✅ CÓDIGO DE VINCULACIÓN OBTENIDO

  Ve a WhatsApp → Dispositivos vinculados → Vincular con número

  🔑 Tu código:  A1B2-C3D4 

  El código expira en unos minutos. Ingrésalo rápido.

[OK]    ¡Autenticación exitosa! Sesión guardada.
[OK]    ¡Bot listo! Conectado como TuNombre (+521234567890)
