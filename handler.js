import chalk from 'chalk'

export default async function handler(sock, m, chatUpdate) {
    if (!m) return
    
    try {
        const sender = m.sender?.split('@')?.[0] || '0'
        // Detectar si es dueño
        const isOwner = [sock.user?.id?.split(':')[0], ...global.owner.map(([number]) => number)].includes(sender)

        // Log de mensaje en consola
        console.log(chalk.bgBlue(`[ MSG ]`), chalk.cyan(sender), ':', m.body || m.type)

        // Si los plugins no han cargado, no hacemos nada para evitar el error
        if (!global.plugins || Object.keys(global.plugins).length === 0) return

        const prefix = global.prefix || '|'
        const isCmd = m.body && m.body.startsWith(prefix)
        const command = isCmd ? m.body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ''

        if (isCmd) {
            // Buscamos el comando con seguridad
            let plugin = Object.values(global.plugins).find(p => 
                p && p.command && (Array.isArray(p.command) ? p.command.includes(command) : p.command === command)
            )

            if (plugin) {
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
        console.error(chalk.red(`[ ERROR HANDLER ]`), e)
    }
}
