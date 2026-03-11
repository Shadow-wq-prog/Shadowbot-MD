/*
Bot: Sηαdοωβοτ
Owner: Shadow Flash
*/

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import readline from 'readline'

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text) => new Promise((resolve) => rl.question(text, resolve))

import pkgBaileys from '@whiskeysockets/baileys'
const makeWASocket = pkgBaileys.default || pkgBaileys
import { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, delay } from '@whiskeysockets/baileys'
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
        browser: ['Sηαdοωβοτ', 'Chrome', '1.0.0'],
        printQRInTerminal: false
    })

    if (!sock.authState.creds.registered) {
        console.log('--- VINCULACIÓN POR CÓDIGO ---')
        const phoneNumber = await question('📝 Ingresa tu número:\n')
        await delay(3000)
        const code = await sock.requestPairingCode(phoneNumber.trim())
        console.log(`\n🔑 CÓDIGO: \x1b[32m${code}\x1b[0m\n`)
    }

    const plugins = {}
    const pluginsFolder = path.join(__dirname, 'plugins')

    const loadPlugins = async (dir) => {
        const files = fs.readdirSync(dir)
        for (const file of files) {
            const fullPath = path.join(dir, file)
            if (fs.lstatSync(fullPath).isDirectory()) {
                await loadPlugins(fullPath)
            } else if (file.endsWith('.js') || file.endsWith('.cjs')) {
                try {
                    // Importación dinámica que soporta ambos formatos
                    const plugin = await import(`file://${fullPath}?u=${Date.now()}`)
                    plugins[file] = plugin.default || plugin
                } catch (e) {
                    console.log(`❌ Error en ${file}: ${e.message}`)
                }
            }
        }
    }
    await loadPlugins(pluginsFolder)
    console.log(`[!] ${Object.keys(plugins).length} Plugins cargados correctamente.`)

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut
            if (shouldReconnect) startBot()
        } else if (connection === 'open') {
            console.log('✅ Sηαdοωβοτ ONLINE')
        }
    })

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0]
        if (!m || !m.message) return
        const from = m.key.remoteJid
        const body = (m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || '')
        const prefix = '.'
        
        if (!body.startsWith(prefix)) return
        const args = body.slice(prefix.length).trim().split(/ +/)
        const command = args.shift().toLowerCase()

        for (const file in plugins) {
            const p = plugins[file]
            const isMatch = Array.isArray(p.command) ? p.command.includes(command) : p.command === command
            if (isMatch) {
                try {
                    console.log(`🏃 Ejecutando: ${command}`)
                    await p.run(sock, m, args)
                } catch (e) { console.error(e) }
            }
        }
    })
}

startBot()
