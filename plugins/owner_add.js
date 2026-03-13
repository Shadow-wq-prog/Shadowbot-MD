/*
Creador: Shadow Flash
Bot: Sηαdοωβοτ
*/

import fs from 'fs'
import path from 'path'

export default {
  command: ['addowner', 'delowner'],
  isOwner: true,
  run: async (client, m, { args }) => { // Ajustado al formato de tu Handler
    const from = m.key.remoteJid
    const jsonPath = path.join(process.cwd(), 'src', 'owners.json') // Ruta estándar
    
    // Si el archivo no existe, lo creamos vacío
    if (!fs.existsSync(jsonPath)) {
        fs.writeFileSync(jsonPath, JSON.stringify(["51983564381"])) 
    }

    let owners = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
    
    // Obtenemos el número (ya sea por mención o por texto)
    let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null

    if (!who) return client.sendMessage(from, { text: '📝 *Sηαdοωβοτ:* Etiqueta a alguien o responde a su mensaje para usar este comando.' }, { quoted: m })

    const commandUsed = m.body.toLowerCase()

    if (commandUsed.includes('addowner')) {
      if (owners.includes(who.split('@')[0])) return client.sendMessage(from, { text: '⚠️ Este usuario ya es owner.' }, { quoted: m })
      
      owners.push(who.split('@')[0])
      fs.writeFileSync(jsonPath, JSON.stringify(owners, null, 2))
      await client.sendMessage(from, { text: `✅ *Sηαdοωβοτ:* @${who.split('@')[0]} ahora es Owner.`, mentions: [who] }, { quoted: m })
    
    } else if (commandUsed.includes('delowner')) {
      if (!owners.includes(who.split('@')[0])) return client.sendMessage(from, { text: '⚠️ Este usuario no está en la lista.' }, { quoted: m })
      
      owners = owners.filter(id => id !== who.split('@')[0])
      fs.writeFileSync(jsonPath, JSON.stringify(owners, null, 2))
      await client.sendMessage(from, { text: `❌ *Sηαdοωβοτ:* @${who.split('@')[0]} ya no es Owner.`, mentions: [who] }, { quoted: m })
    }
  }
}
