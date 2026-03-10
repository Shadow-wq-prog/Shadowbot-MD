const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const chalk = require('chalk');
const config = require('../config/config');
const logger = require('./utils/logger');
const { loadCommands } = require('./handlers/commandHandler');
const { handleMessage } = require('./handlers/messageHandler');
const { handleGroupUpdate } = require('./handlers/groupHandler');

console.log(
  chalk.bold.black.bgWhite(
    `\n  🌑  ${config.bot.name.toUpperCase()}  |  WhatsApp Bot  \n`
  )
);
console.log(chalk.gray('  Iniciando...\n'));

loadCommands();

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

client.on('qr', (qr) => {
  logger.info('Código QR recibido. Escanéalo con tu WhatsApp:');
  qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
  logger.success('¡Autenticación exitosa!');
});

client.on('auth_failure', (msg) => {
  logger.error(`Error de autenticación: ${msg}`);
  process.exit(1);
});

client.on('ready', async () => {
  const info = client.info;
  logger.success(`¡Bot listo! Conectado como ${info.pushname} (+${info.wid.user})`);
  logger.info(`Prefijo: ${config.bot.prefix} | Anti-spam: ${config.features.antiSpam}`);
});

client.on('message', (msg) => handleMessage(client, msg));

client.on('group_join', (notification) => handleGroupUpdate(client, notification));
client.on('group_leave', (notification) => handleGroupUpdate(client, notification));

client.on('disconnected', (reason) => {
  logger.warn(`Cliente desconectado: ${reason}`);
});

process.on('unhandledRejection', (err) => {
  logger.error(`Promesa rechazada sin manejar: ${err.message}`);
});
process.on('uncaughtException', (err) => {
  logger.error(`Excepción no capturada: ${err.message}`);
});

client.initialize();
