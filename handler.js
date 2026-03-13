import chalk from 'chalk'

export default async function handler(sock, m, chatUpdate) {
    if (!m) return
    
    try {
        // --- PROTECCIÓN SENDER & OWNER ---
        const sender = m.sender?.split('@')?.[0] || '0'
        const isOwner = [sock.user?.id?.split(':')[0], ...global.owner.map(([number]) => number)].includes(sender)

        // Log en consola para ver si el bot escucha
        console.log(chalk.bgBlue(`[ MSG ]`), chalk.cyan(sender), ':', m.body || m.type)

        // Verificación de plugins cargados
        if (!global.plugins || Object.keys(global.plugins).length === 0) return

        // Configuración de prefijo (usamos '|' por defecto)
        const prefix = global.prefix || '|'
        const isCmd = m.body && m.body.startsWith(prefix)
        const command = isCmd ? m.body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ''

        if (isCmd) {
            // Buscamos el comando en los plugins cargados
            let plugin = Object.values(global.plugins).find(p => 
                p && p.command && (Array.isArray(p.command) ? p.command.includes(command) : p.command === command)
            )

            if (plugin) {
                // --- FIX DEFINITIVO PARA "PLUGIN IS NOT A FUNCTION" ---
                // Detectamos si el plugin es una función directa o tiene un .run / .default
                let run = typeof plugin === 'function' ? plugin : plugin.run || plugin.default
                
                if (typeof run === 'function') {
                    await run(m, { 
                        sock, 
                        client: sock, 
                        usedPrefix: prefix, 
                        command, 
                        text: m.body.slice(prefix.length + command.length).trim(), 
                        isOwner,
                        isROwner: isOwner // Para compatibilidad
                    })
                } else {
                    console.log(chalk.yellow(`[ ! ] El plugin '${command}' no tiene una función válida.`))
                }
            }
        }
    } catch (e) {
        console.error(chalk.red(`[ ERROR HANDLER ]`), e)
    }
}
