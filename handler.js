import chalk from 'chalk'

export default async function handler(sock, m, chatUpdate) {
    if (!m) return
    
    try {
        const sender = m.sender?.split('@')?.[0] || '0'
        // Verificación de dueño según tus ajustes
        const isOwner = [sock.user?.id?.split(':')[0], ...global.owner.map(([number]) => number)].includes(sender)

        console.log(chalk.bgBlue(`[ MSG ]`), chalk.cyan(sender), ':', m.body || m.type)

        if (!global.plugins || Object.keys(global.plugins).length === 0) return

        // Usamos el prefijo configurado para Sηαdοωβοτ
        const prefix = global.prefix || '/' 
        const isCmd = m.body && m.body.startsWith(prefix)
        const command = isCmd ? m.body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ''

        if (isCmd) {
            let plugin = Object.values(global.plugins).find(p => 
                p && p.command && (Array.isArray(p.command) ? p.command.includes(command) : p.command === command)
            )

            if (plugin) {
                let run = typeof plugin === 'function' ? plugin : plugin.run || plugin.default
                
                if (typeof run === 'function') {
                    const text = m.body.slice(prefix.length + command.length).trim()
                    const args = text.split(' ').filter(v => v)

                    // Creamos el objeto de parámetros para que NADA sea undefined
                    const conn = sock
                    const client = sock
                    const usedPrefix = prefix

                    // Ejecución con protección total de objetos
                    await run.call(sock, m, { 
                        sock, conn, client, usedPrefix, command, args, text, isOwner
                    })
                }
            }
        }
    } catch (e) {
        console.error(chalk.red(`[ ERROR HANDLER ]`), e)
    }
}
