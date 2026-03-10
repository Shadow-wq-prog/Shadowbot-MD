const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const gradient = require('gradient-string');

// Configuración básica
const botName = 'Sηαdοωβοτ';

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        // Ruta exacta para que Termux encuentre el navegador que instalamos
        executablePath: '/data/data/com.termux/files/usr/bin/chromium',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process'
        ]
    }
});

// Mostrar código QR en la terminal
client.on('qr', (qr) => {
    console.log(gradient.pastel('\n[!] Escanea este código QR para vincular Sηαdοωβοτ:'));
    qrcode.generate(qr, { small: true });
});

// Mensaje cuando el bot esté listo
client.on('ready', () => {
    console.log(gradient.rainbow(`\n\n=== ${botName} ESTÁ ENCENDIDO Y LISTO ===\n`));
});

// Comando de prueba: .ping
client.on('message', async (msg) => {
    if (msg.body === '.ping') {
        msg.reply('¡Pong! 🏓 El bot está funcionando correctamente.');
    }
});

// Inicio del bot
console.log(gradient.retro(`\nIniciando ${botName}... Por favor, espera a que cargue el navegador.\n`));
client.initialize();
        
