import fs from 'fs'

export default {
  command: ['addowner', 'delowner'],
  isOwner: true,
  run: async (sock, m, args) => {
    const jsonPath = './plugins/Owner/owners.json'
    let owners = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
    const who = m.message.extendedTextMessage?.contextInfo?.participant || args[0]?.replace(/\D/g, '')

    if (!who) return sock.sendMessage(m.key.remoteJid, { text: '📝 Etiqueta a alguien o escribe su número.' })

    if (m.body.includes('addowner')) {
      if (owners.includes(who)) return sock.sendMessage(m.key.remoteJid, { text: '⚠️ Ya es owner.' })
      owners.push(who)
      fs.writeFileSync(jsonPath, JSON.stringify(owners))
      await sock.sendMessage(m.key.remoteJid, { text: `✅ @${who.split('@')[0]} ahora es Owner.`, mentions: [who + '@s.whatsapp.net'] })
    }
  }
}
