/*
Bot: Sηαdοωβοτ
Carpeta: plugins/Owner/
*/

import fs from 'fs'

export default {
    command: ['addowner', 'delowner', 'listowner'],
    category: 'owner',
    run: async (sock, m, args) => {
        const jsonPath = './plugins/Owner/owners.json'
        
        // Crear el archivo si no existe para evitar errores
        if (!fs.existsSync(jsonPath)) {
            fs.writeFileSync(jsonPath, JSON.stringify(["51983564381"]))
        }

        let owners = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
        const text = args.join(' ')
        const who = m.mentionedJid?.[0] || (text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : null)

        if (m.body.includes('listowner')) {
            let list = '👑 *LISTA DE OWNERS*\n\n'
            owners.forEach((v, i) => {
                list += `${i + 1}. @${v.split('@')[0]}\n`
            })
            return sock.sendMessage(m.key.remoteJid, { text: list, mentions: owners.map(v => v.includes('@') ? v : v + '@s.whatsapp.net') }, { quoted: m })
        }

        if (!who) return sock.sendMessage(m.key.remoteJid, { text: '📝 Etiqueta a alguien o escribe su número para esta acción.' })

        const userNumber = who.split('@')[0]

        if (m.body.includes('addowner')) {
            if (owners.includes(userNumber)) return sock.sendMessage(m.key.remoteJid, { text: '⚠️ Este usuario ya es owner.' })
            owners.push(userNumber)
            fs.writeFileSync(jsonPath, JSON.stringify(owners))
            await sock.sendMessage(m.key.remoteJid, { text: `✅ @${userNumber} ha sido añadido como Owner.`, mentions: [who] })
        }

        if (m.body.includes('delowner')) {
            if (!owners.includes(userNumber)) return sock.sendMessage(m.key.remoteJid, { text: '⚠️ Este usuario no está en la lista.' })
            owners = owners.filter(v => v !== userNumber)
            fs.writeFileSync(jsonPath, JSON.stringify(owners))
            await sock.sendMessage(m.key.remoteJid, { text: `❌ @${userNumber} ha sido eliminado de la lista de Owners.`, mentions: [who] })
        }
    }
}
