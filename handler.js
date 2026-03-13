/*
Creador: Shadow Flash
Bot: Sηαdοωβοτ (Fix de Error Split)
*/

import chalk from 'chalk'
import fs from 'fs'

export default async function handler(sock, m, chatUpdate) {
    if (!m) return
    
    try {
        // --- SEGURIDAD PARA EL SENDER ---
        // Esto evita el error de split definitivamente
        const sender = m.sender?.split('@')?.[0] || '0'
        const isOwner = [sock.user?.id?.split(':')[0], ...global.owner.map(([number]) => number)].includes(sender)

        // Logs para ver en Termux si el bot escucha
        console.log(chalk.bgBlue(`[ MSG ]`), chalk.cyan(sender), ':', m.body || m.type)

        // Cargar Base de Datos
        if (global.db && global.db.data) {
            let user = global.db.data.users[m.sender]
            if (typeof user !== 'object') global.db.data.users[m.sender] = {}
            if (user) {
                if (!('name' in user)) user.name = m.pushName || 'Usuario'
                if (!('premium' in user)) user.premium = false
            } else {
                global.db.data.users[m.sender] = {
                    name: m.pushName || 'Usuario',
                    premium: false
                }
            }
        }

        // --- MANEJO DE COMANDOS ---
        const prefix = global.prefix || '|'
        const isCmd = m.body && m.body.startsWith(prefix)
        const command = isCmd ? m.body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ''

        if (isCmd) {
            let plugin = Object.values(global.plugins).find(p => 
                p.command && (Array.isArray(p.command) ? p.command.includes(command) : p.command === command)
            )

            if (plugin) {
                // Ejecución segura del plugin
                await plugin(m, { 
                    sock, 
                    client: sock, 
                    usedPrefix: prefix, 
                    command, 
                    text: m.body.slice(prefix.length + command.length).trim(), 
                    isOwner 
                })
            }
        }
    } catch (e) {
        console.error(chalk.red(`[ ERROR FATAL ]`), e)
    }
}
