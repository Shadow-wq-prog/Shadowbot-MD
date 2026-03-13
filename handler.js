import { smsg } from './lib/message.js'
import chalk from 'chalk'

export default async function handler(sock, m, chatUpdate) {
    if (!m) return
    
    // ESTO MOSTRARÁ EN TERMUX SI EL BOT LEE EL MENSAJE
    console.log(chalk.black(chalk.bgCyan(`[ MSG ]`)), chalk.green(m.pushName || 'User'), ':', chalk.white(m.body || m.type))

    try {
        // Cargar base de datos (seguro)
        let user = global.db.data.users[m.sender]
        if (typeof user !== 'object') global.db.data.users[m.sender] = {}
        
        // --- CONFIGURACIÓN DE PREFIJO ---
        // Tu prefijo es '|' según tu settings.js
        let usedPrefix = '|' 
        let isCmd = m.body && m.body.startsWith(usedPrefix)
        let command = isCmd ? m.body.slice(usedPrefix.length).trim().split(' ').shift().toLowerCase() : ''

        if (isCmd) {
            // Buscamos el comando en los plugins
            let plugin = Object.values(global.plugins).find(p => 
                p.command && (Array.isArray(p.command) ? p.command.includes(command) : p.command === command)
            )

            if (plugin) {
                // Si el comando existe, lo ejecutamos
                await plugin(m, { 
                    sock, 
                    client: sock, 
                    usedPrefix, 
                    command, 
                    text: m.body.slice(usedPrefix.length + command.length).trim(),
                    isOwner: global.owner.some(([number]) => number === m.sender.split('@')[0])
                })
            } else {
                console.log(chalk.yellow(`[ ! ] Comando no encontrado: ${command}`))
            }
        }
    } catch (e) {
        console.error(chalk.red(`[ ERROR ]`), e)
    }
}
