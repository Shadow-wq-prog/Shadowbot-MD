/*
Creador: Shadow Flash
Bot: Sηαdοωβοτ (Handler Optimizado)
*/

import { smsg } from './lib/message.js'
import chalk from 'chalk'
import fs from 'fs'

export default async function handler(sock, m, chatUpdate) {
    if (!m) return
    try {
        // Cargar base de datos
        let user = global.db.data.users[m.sender]
        if (typeof user !== 'object') global.db.data.users[m.sender] = {}
        if (user) {
            if (!('name' in user)) user.name = m.name
            if (!('premium' in user)) user.premium = false
            if (!('limit' in user)) user.limit = 10
        } else {
            global.db.data.users[m.sender] = {
                name: m.name,
                premium: false,
                limit: 10,
            }
        }

        // --- SEGURIDAD PARA EL SPLIT ---
        // Esto evita el error "Cannot read properties of undefined (reading 'split')"
        const isROwner = [sock.decodeJid(sock.user.id), ...global.owner.map(([number]) => number)].map(v => v?.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
        const isOwner = isROwner || m.fromMe
        
        // Prefijo y Comandos
        let usedPrefix = (global.prefix || '.').charAt(0)
        let isCmd = m.body && m.body.startsWith(usedPrefix)
        let command = isCmd ? m.body.slice(usedPrefix.length).trim().split(' ').shift().toLowerCase() : ''

        if (isCmd) {
            // Buscador dinámico de plugins
            let plugin = Object.values(global.plugins).find(p => p.command && (Array.isArray(p.command) ? p.command.includes(command) : p.command === command))
            
            if (plugin) {
                // Verificar si el comando es solo para dueños
                if (plugin.rowner && !isROwner) {
                    m.reply(global.mess.owner)
                    return
                }
                
                // Ejecutar comando
                await plugin(m, { sock, client: sock, usedPrefix, command, isOwner, isROwner })
            }
        }

    } catch (e) {
        console.error(chalk.red(`[ ERROR HANDLER ] →`), e)
        // No enviamos el error al chat para evitar spam de errores
    }
}

// Watcher para recargar plugins en caliente
let file = import.meta.url
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.blueBright(`[ INFO ] Handler.js actualizado`))
})
