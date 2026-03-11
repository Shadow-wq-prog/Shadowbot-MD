import { makeWASocket, useMultiFileAuthState } from '@whiskeysockets/baileys'

async function start() {
    const { state, saveCreds } = await useMultiFileAuthState('sessions')
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true, // <--- ESTA LÍNEA DEBE SER TRUE
        browser: ['Shadowbot', 'Chrome', '1.0.0']
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', (update) => {
        const { connection, qr } = update
        if (qr) {
            console.log("📢 ¡CÓDIGO QR GENERADO! ESCANEA AHORA:")
        }
        if (connection === 'open') console.log("✅ CONECTADO")
    })
}
start()
