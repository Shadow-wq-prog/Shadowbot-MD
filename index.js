/*
Bot: Sηαdοωβοτ
Owner: Shadow Flash
*/

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// --- AUTO-INSTALADOR DE LIBRERÍAS ---
const checkDependencies = () => {
    const dependencies = ['@whiskeysockets/baileys', 'pino', 'qrcode-terminal', '@hapi/boom']
    dependencies.forEach(dep => {
        try {
            import.meta.resolve(dep)
        } catch {
            console.log(`📦 Instalando librería faltante: ${dep}...`)
            execSync(`npm install ${dep}`, { stdio: 'inherit' })
        }
    })
}
checkDependencies()

// --- IMPORTACIONES CORREGIDAS PARA NODE V25 ---
import pkgBaileys from '@whiskeysockets/baileys'
const { makeWASocket, useMultiFileAuthState, DisconnectReason } = pkgBaileys.default || pkgBaileys
import { Boom } from '@hapi/boom'
import pino from 'pino'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function startBot() {
    // Carpeta de sesión
    const { state, saveCreds } = await useMultiFileAuthState('session')

    const sock = makeWASocket({
        version: [2, 3000, 1015901307],
        printQRInTerminal: true,
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: ['Sηαdοωβοτ', 'Chrome', '1.0.0']
    })

    // --- CARGADOR DE PLUGINS ---
    const plugins = {}
    const pluginsFolder = path.join(__dirname, 'plugins')
    if (!fs.existsSync(pluginsFolder)) fs.mkdirSync(pluginsFolder)

    const pluginFiles = fs.readdirSync(pluginsFolder).filter(file => file.endsWith('.js'))
    for (const file of pluginFiles) {
        try {
            const plugin = await import(`./plugins/${file}?update=${Date.now()}`)
            plugins[file] = plugin.default || plugin
        } catch (e) {
            console.log(`❌ Error cargando plugin ${file}:`, e.message)
        }
    }
    console.log(`[!] ${Object.keys(plugins).length} Plugins cargados con éxito.`)
    console.log('=== Sηαdοωβοτ ONLINE ===')

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0]
        if (!m || !m.message || m.key.fromMe) return
        
        const from = m.key.remoteJid
        const body = (m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || '')
        const prefix = '.'
        
        if (!body.startsWith(prefix)) return
        const command = body.slice(prefix.length).trim().split(' ').shift().toLowerCase()
        const args = body.trim().split(/ +/).slice(1)

        // --- EJECUTOR DE PLUGINS ---
        for (const file in plugins) {
            const p = plugins[file]
            if (p && p.command && Array.isArray(p.command) && p.command.includes(command)) {
                try {
                    await p.run(sock, m, args)
                } catch (e) {
                    console.error(`❌ Error en .${command}:`, e)
                    await sock.sendMessage(from, { text: `⚠️ Error en .${command}: ${e.message}` }, { quoted: m })
                }
            }
        }
    })

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('🔄 Conexión cerrada. Reintentando:', shouldReconnect)
            if (shouldReconnect) startBot()
        } else if (connection === 'open') {
            console.log('✅ Sηαdοωβοτ conectado a WhatsApp')
        }
    })
}

startBot()
