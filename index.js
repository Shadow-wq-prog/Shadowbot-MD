/*
Bot: Sηαdοωβοτ
Owner: Shadow Flash
*/

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import readline from 'readline'

// --- INTERFAZ PARA EL NÚMERO ---
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text) => new Promise((resolve) => rl.question(text, resolve))

// --- AUTO-INSTALADOR ---
const checkDependencies = () => {
    const dependencies = ['@whiskeysockets/baileys', 'pino', 'qrcode-terminal', '@hapi/boom']
    dependencies.forEach(dep => {
        try {
            import.meta.resolve(dep)
        } catch {
            console.log(`📦 Instalando: ${dep}...`)
            execSync(`npm install ${dep}`, { stdio: 'inherit' })
        }
    })
}
checkDependencies()

import pkgBaileys from '@whiskeysockets/baileys'
const makeWASocket = pkgBaileys.default || pkgBaileys
import { useMultiFileAuthState, DisconnectReason, delay, fetchLatestBaileysVersion } from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import pino from 'pino'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session')
    const { version } = await fetchLatestBaileysVersion()

    const sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: ['Ubuntu', 'Chrome', '20.0.04'],
        printQRInTerminal: false // Desactivamos QR
    })

    // --- LÓGICA DE CÓDIGO DE 8 DÍGITOS ---
    if (!sock.authState.creds.registered) {
        console.log('--- VINCULACIÓN DE Sηαdοωβοτ ---')
        const phoneNumber = await question('📝 Ingresa tu número de WhatsApp (ej: 519XXXXXXXX):\n')
        const code = await sock.requestPairingCode(phoneNumber.trim())
        console.log(`\n🔑 TU CÓDIGO DE VINCULACIÓN ES: \x1b[32m${code}\x1b[0m\n`)
        console.log('Ve a WhatsApp > Dispositivos vinculados > Vincular con código.\n')
    }

    // --- CARGADOR DE PLUGINS ---
    const plugins = {}
    const pluginFiles = fs.readdirSync(path.join(__dirname, 'plugins')).filter(file => file.endsWith('.js'))
    for (const file of pluginFiles) {
        try {
            const plugin = await import(`./plugins/${file}?update=${Date.now()}`)
            plugins[file] = plugin.default || plugin
        } catch (e) {
            console.log(`❌ Error en plugin ${file}:`, e.message)
        }
    }
    console.log(`[!] ${Object.keys(plugins).length} Plugins cargados exitosamente.`)

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('🔄 Conexión cerrada. Reintentando:', shouldReconnect)
            if (shouldReconnect) startBot()
        } else if (connection === 'open') {
            console.log('✅ Sηαdοωβοτ ONLINE - Vinculación Exitosa')
        }
    })

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0]
        if (!m || !m.message || m.key.fromMe) return
        const from = m.key.remoteJid
        const body = (m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || '')
        const prefix = '.'
        
        if (!body.startsWith(prefix)) return
        const command = body.slice(prefix.length).trim().split(' ').shift().toLowerCase()
        const args = body.trim().split(/ +/).slice(1)

        for (const file in plugins) {
            const p = plugins[file]
            if (p && p.command && Array.isArray(p.command) && p.command.includes(command)) {
                try {
                    await p.run(sock, m, args)
                } catch (e) {
                    await sock.sendMessage(from, { text: `⚠️ Error en .${command}: ${e.message}` }, { quoted: m })
                }
            }
        }
    })
}

startBot()
