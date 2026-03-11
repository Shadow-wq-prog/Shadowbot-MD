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

// --- AUTO-INSTALADOR ---
const checkDependencies = () => {
    const deps = ['@whiskeysockets/baileys', 'pino', 'qrcode-terminal', '@hapi/boom']
    deps.forEach(dep => {
        try { import.meta.resolve(dep) } catch {
            console.log(`📦 Instalando: ${dep}...`)
            execSync(`npm install ${dep}`, { stdio: 'inherit' })
        }
    })
}
checkDependencies()

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
        const phoneNumber = await question('📝 Ingresa tu número (ej: 519XXXXXXXX):\n')
        await delay(3000)
        try {
            const code = await sock.requestPairingCode(phoneNumber.trim())
            console.log(`\n🔑 CÓDIGO DE VINCULACIÓN: \x1b[32m${code}\x1b[0m\n`)
        } catch (err) {
            console.log('❌ Error en vinculación. Reintenta.')
            process.exit(1)
        }
    }

    // CARGADOR DINÁMICO DE PLUGINS
    const plugins = {}
    const pluginsFolder = path.join(__dirname, 'plugins')
    if (!fs.existsSync(pluginsFolder)) fs.mkdirSync(pluginsFolder)

    const loadPlugins = async (dir) => {
        const folders = fs.readdirSync(dir)
        for (const file of folders) {
            const fullPath = path.join(dir, file)
            if (fs.lstatSync(fullPath).isDirectory()) {
                await loadPlugins(fullPath)
            } else if (file.endsWith('.js')) {
                try {
                    const plugin = await import(`./${path.relative(__dirname, fullPath)}?u=${Date.now()}`)
                    plugins[file] = plugin.default || plugin
                } catch (e) {
                    console.log(`❌ Fallo en ${file}: ${e.message}`)
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

        // Verificación de Dueño
        let owners = ["51983564381"]
        try {
            const data = fs.readFileSync('./plugins/Owner/owners.json', 'utf-8')
            owners = JSON.parse(data)
        } catch (e) {}
        
        const isOwner = owners.some(num => from.includes(num))

        for (const file in plugins) {
            const p = plugins[file]
            const isMatch = Array.isArray(p.command) ? p.command.includes(command) : p.command === command
            
            if (isMatch) {
                if (p.isOwner && !isOwner) {
                    return sock.sendMessage(from, { text: '❌ Solo el Owner puede usar este comando.' }, { quoted: m })
                }
                try {
                    console.log(`🏃 Ejecutando: ${command} | De: ${from}`)
                    await p.run(sock, m, args)
                } catch (e) {
                    console.error(e)
                }
            }
        }
    })
}

startBot()
