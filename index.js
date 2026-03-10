const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const gradient = require('gradient-string');

// Configuración básica directa
const botName = 'Sηαdοωβοτ';
const prefix = '.';

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        executablePath: '/data/data/com.termux/files/usr/bin/chromium',
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox', 
            '--disable-dev-shm-usage', 
            '--single-process'
        ]
    }
});

client.on('qr', (qr) => {
    console.log(gradient.pastel('Generando código QR... (Aunque usaremos el de 8 dígitos)'));
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log(gradient.rainbow(`\n\n=== ${botName} ESTÁ ENCENDIDO ===\n`));
});

// Lógica de mensajes básica
client.on('message', async (msg) => {
    if (msg.body === `${prefix}ping`) {
        msg.reply('pong');
    }
});

console.log(gradient.retro('Iniciando Sηαdοωβοτ... Por favor espera.'));
client.initialize();
