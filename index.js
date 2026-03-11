/*
Bot: Sηαdοωβοτ
Owner: Shadow Flash
Versión: Definitiva 2026
*/

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import readline from 'readline'

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text) => new Promise((resolve) => rl.question(text, resolve))

// --- AUTO-INSTALADOR DE DEPENDENCIAS ---
const checkDependencies = () => {
    const deps = ['@whiskeysockets/baileys', 'pino', 'qrcode-terminal', '@hapi/boom', 'yt-search']
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

    // --- VINCULACIÓN ---
    if (!sock.authState.creds.registered) {
        console.log('--- VINCULACIÓN DE Sηαdοωβοτ ---')
        const phoneNumber = await question('📝 Ingresa tu número de WhatsApp (ej: 519XXXXXXXX):\n')
        console.log('⏳ Conectando... espera 3 segundos.')
        await delay(3000)
        try {
            const code = await sock.requestPairingCode(phoneNumber.trim())
            console.log(`\n🔑 TU CÓDIGO DE VINCULACIÓN ES: \x1b[32m${code}\x1b[0m\n`)
        } catch (err) {
            console.log('❌ Error al generar código. Intenta de nuevo.')
            process.exit(1)
        }
    }

    // --- CARGADOR DINÁMICO DE PLUGINS (Soporta .js y .cjs) ---
    const plugins = {}
    const pluginsFolder = path.join(__dirname, 'plugins')
    if (!fs.existsSync(pluginsFolder)) fs.mkdirSync(pluginsFolder)

    const loadPlugins = async (dir) => {
        const files = fs.readdirSync(dir)
        for (const file of files) {
            const fullPath = path.join(dir, file)
            if (fs.lstatSync(fullPath).isDirectory()) {
                await loadPlugins(fullPath)
            } else if (file.endsWith('.js') || file.endsWith('.cjs')) {
                try {
                    const plugin = await import(`file://${fullPath}?u=${Date.now()}`)
                    plugins[file] = plugin.default || plugin
                } catch (e) {
                    console.log(`❌ Error cargando ${file}: ${e.message}`)
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

    // --- MANEJADOR DE MENSAJES ---
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0]
        if (!m || !m.message) return
        
        const from = m.key.remoteJid
        const body = (m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || '')
        const prefix = '.' 
        
        if (!body.startsWith(prefix)) return

        const args = body.slice(prefix.length).trim().split(/ +/)
        const command = args.shift().toLowerCase()

        // --- LÓGICA DE BÚSQUEDA ---
        let comandoEjecutado = false

        // Lista de Owners (puedes añadir más aquí)
        let owners = ["51983564381"]
        try {
            if (fs.existsSync('./plugins/Owner/owners.json')) {
                owners = JSON.parse(fs.readFileSync('./plugins/Owner/owners.json', 'utf-8'))
            }
        } catch (e) {}
        
        const isOwner = owners.some(num => from.includes(num))

        for (const file in plugins) {
            const p = plugins[file]
            const isMatch = Array.isArray(p.command) ? p.command.includes(command) : p.command === command
            
            if (isMatch) {
                comandoEjecutado = true
                if (p.isOwner && !isOwner) {
                    return sock.sendMessage(from, { text: '❌ Este comando es exclusivo para mi dueño.' }, { quoted: m })
                }
                try {
                    console.log(`🏃 Ejecutando: ${command} | De: ${from}`)
                    await p.run(sock, m, args)
                } catch (e) {
                    console.error(`❌ Error en plugin ${file}:`, e)
                }
                break 
            }
        }

        // --- RESPUESTA SI EL COMANDO NO EXISTE ---
        if (!comandoEjecutado) {
            const textoError = `⚠️ El comando *${prefix}${command}* no existe.\n\n💡 Escribe *${prefix}menu* para ver la lista de comandos disponibles.`
            await sock.sendMessage(from, { text: textoError }, { quoted: m })
        }
    })
}

startBot()
