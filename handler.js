import chalk from 'chalk'

export default async function handler(sock, m, chatUpdate) {
    if (!m) return
    
    try {
        const sender = m.sender?.split('@')?.[0] || '0'
        const isOwner = [sock.user?.id?.split(':')[0], ...global.owner.map(([number]) => number)].includes(sender)

        console.log(chalk.bgBlue(`[ MSG ]`), chalk.cyan(sender), ':', m.body || m.type)

        if (!global.plugins || Object.keys(global.plugins).length === 0) return

        const prefix = global.prefix || '/' 
        const isCmd = m.body && m.body.startsWith(prefix)
        const command = isCmd ? m.body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ''

        if (isCmd) {
            let plugin = Object.values(global.plugins).find(p => 
                p && p.command && (Array.isArray(p.command) ? p.command.includes(command) : p.command === command)
            )

            if (plugin) {
                // Buscamos la función 'run' o el export default
                let run = typeof plugin === 'function' ? plugin : plugin.run || plugin.default
                
                if (typeof run === 'function') {
                    const text = m.body.slice(prefix.length + command.length).trim()
                    const args = text.split(' ').filter(v => v)

                    // --- AQUÍ ESTÁ EL TRUCO PARA TUS COMANDOS ---
                    // Pasamos sock, m, y el objeto con args como tercer parámetro
                    await run(sock, m, { 
                        args, 
                        text, 
                        command, 
                        usedPrefix: prefix, 
                        isOwner,
                        conn: sock,
                        client: sock
                    })
                }
            }
        }
    } catch (e) {
        console.error(chalk.red(`[ ERROR HANDLER ]`), e)
    }
}
