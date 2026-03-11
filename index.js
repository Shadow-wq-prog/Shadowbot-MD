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
// Añadimos 'delay' a las importaciones
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
        browser: ['Ubuntu', 'Chrome', '20.0.04'],
        printQRInTerminal: false
    })

    if (!sock.authState.creds.registered) {
        console.log('--- VINCULACIÓN DE Sηαdοωβοτ ---')
        const phoneNumber = await question('📝 Ingresa tu número de WhatsApp (ej: 519XXXXXXXX):\n')
        
        // --- LA SOLUCIÓN: ESPERAR 3 SEGUNDOS ---
        console.log('⏳ Conectando con WhatsApp... espera un momento.')
        await delay(3000) 
        
        try {
            const code = await sock.requestPairingCode(phoneNumber.trim())
            console.log(`\n🔑 TU CÓDIGO DE VINCULACIÓN ES: \x1b[32m${code}\x1b[0m\n`)
        } catch (err) {
            console.log('❌ Error al generar código. Inténtalo de nuevo en unos segundos.')
            process.exit(1)
        }
    }

    // CARGADOR DE PLUGINS (Igual que antes)
    const plugins = {}
    const pluginsFolder = path.join(__dirname, 'plugins')
    if (!fs.existsSync(pluginsFolder)) fs.mkdirSync(pluginsFolder)

    const readPlugins = (dir) => {
        const files = fs.readdirSync(dir)
        for (const file of files) {
            const fullPath = path.join(dir, file)
            if (fs.lstatSync(fullPath).isDirectory()) {
                readPlugins(fullPath)
            } else if (file.endsWith('.js')) {
                import(`./${path.relative(__dirname, fullPath)}?u=${Date.now()}`).then(m => {
                    plugins[file] = m.default || m
                }).catch(e => console.log(`❌ Error en ${file}: ${e.message}`))
            }
        }
    }
    readPlugins(pluginsFolder)
    
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
        const command = body.slice(prefix.length).trim().split(' ').shift().toLowerCase()
        const args = body.trim().split(/ +/).slice(1)

        // Verificación de Dueño
        let owners = ["51983564381"]
        try {
            owners = JSON.parse(fs.readFileSync('./plugins/Owner/owners.json', 'utf-8'))
        } catch (e) {}
        
        const isOwner = owners.some(num => from.includes(num))

        for (const file in plugins) {
            const p = plugins[file]
            if (p && p.command && p.command.includes(command)) {
                if (p.isOwner && !isOwner) {
                    return sock.sendMessage(from, { text: '❌ Solo el owner puede usar esto.' }, { quoted: m })
                }
                try {
                    await p.run(sock, m, args)
                } catch (e) { console.error(e) }
            }
        }
    })
}

startBot()
