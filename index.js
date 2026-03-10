const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const gradient = require('gradient-string');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        executablePath: 'chromium', 
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log(gradient.pastel('Generando código QR...'));
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log(gradient.rainbow('\n\n=== BOT ENCENDIDO ===\n'));
});

client.on('message', async (msg) => {
    if (msg.body === '.ping') {
        msg.reply('pong');
    }
});

console.log(gradient.retro('Iniciando Sηαdοωβοτ...'));
client.initialize();
