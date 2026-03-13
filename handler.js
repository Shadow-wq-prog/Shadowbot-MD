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
                // Buscamos la función ejecutable
                let run = typeof plugin === 'function' ? plugin : plugin.run || plugin.default
                
                if (typeof run === 'function') {
                    const text = m.body.slice(prefix.length + command.length).trim()
                    const args = text.split(' ').filter(v => v)

                    // Blindaje total: pasamos el objeto de parámetros
                    await run(m, { 
                        sock, 
                        conn: sock, 
                        client: sock, 
                        usedPrefix: prefix, 
                        command, 
                        args, // Si esto falta, el destructuring falla
                        text, 
                        isOwner 
                    })
                }
            }
        }
    } catch (e) {
        console.error(chalk.red(`[ ERROR HANDLER ]`), e)
    }
}
