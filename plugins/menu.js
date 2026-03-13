/*
Creador: Shadow Flash
Bot: Sηαdοωβοτ (Menú Auto-Actualizable)
*/

import { promises } from 'fs'
import { join } from 'path'
import chalk from 'chalk'

export default async function (m, { client, usedPrefix, command }) {
    try {
        // Estética y hora
        const date = new Date().toLocaleDateString('es-ES')
        const time = new Date().toLocaleTimeString('es-ES')
        
        // Obtenemos todos los plugins cargados
        const help = Object.values(global.plugins).filter(p => !p.disabled)
        
        // Organizamos por categorías
        const groups = {}
        for (const plugin of help) {
            if (!plugin.category) continue
            if (!(plugin.category in groups)) groups[plugin.category] = []
            groups[plugin.category].push(plugin)
        }

        let menuText = `╭┈──̇─̇─̇────̇─̇─̇──◯◝\n`
        menuText += `┊「 *Sηαdοωβοτ - MD* 」\n`
        menuText += `┊︶︶︶︶︶︶︶︶︶︶︶\n`
        menuText += `┊  *Owner ›* Shadow Flash\n`
        menuText += `┊  *Fecha ›* ${date}\n`
        menuText += `┊  *Hora ›* ${time}\n`
        menuText += `┊┈─────̇─̇─̇─────◯◝\n`
        menuText += `┊➤ *Usa el prefijo: [ ${usedPrefix} ]*\n`
        menuText += `╰─────────────────╯\n\n`

        // Generar lista por categoría
        const keys = Object.keys(groups).sort()
        for (const category of keys) {
            menuText += `┏┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n`
            menuText += `┃ ❖ *${category.toUpperCase()}*\n`
            menuText += `┣┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n`
            for (const plugin of groups[category]) {
                // Si el plugin tiene varios comandos (ej: help, menu)
                const commands = Array.isArray(plugin.command) ? plugin.command : [plugin.command]
                for (const cmd of commands) {
                    menuText += `┃ ➤ ${usedPrefix}${cmd}\n`
                }
            }
            menuText += `┗┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n`
        }

        menuText += `*Sηαdοωβοτ By Shadow Flash*`

        // Enviar con imagen (usando la del bot o la del usuario)
        const pp = await client.profilePictureUrl(m.sender, 'image').catch(_ => 'https://cdn.stellarwa.xyz/files/1755559736781.jpeg')
        
        await client.sendMessage(m.chat, { 
            image: { url: pp }, 
            caption: menuText,
            contextInfo: {
                externalAdReply: {
                    title: 'Sηαdοωβοτ Menu Active',
                    body: 'Shadow Flash Official',
                    mediaType: 1,
                    showAdAttribution: true,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m })

    } catch (e) {
        console.error(chalk.red(`[ MENU ERROR ] →`), e)
        m.reply('❌ Error al generar el menú.')
    }
}

// Configuración del comando
export const command = ['menu', 'help', 'bot']
export const category = 'main'
