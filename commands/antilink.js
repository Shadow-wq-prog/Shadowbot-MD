/*
Creador: Shadow Flash
Bot: Sηαdοωβοτ
*/

const linkRegex = /(https?:\/\/)?(chat\.whatsapp\.com\/[0-9A-Za-z]{20,24}|whatsapp\.com\/channel\/[0-9A-Za-z]{20,24})/i

const allowedLinks = [
  'https://whatsapp.com/channel/0029VbApwZ9ISTkEBb6ttS3F', // Tu canal
  'https://chat.whatsapp.com/JL3lRO1Fx3sFVEfUDnMrul'
]

export default async (m, client) => {
  if (!m.isGroup || !m.text) return

  const chat = global.db.data.chats[m.chat]
  if (!chat?.antilinks) return

  const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
  const isGroupLink = linkRegex.test(m.text)
  const isAllowed = allowedLinks.some(link => m.text.includes(link))

  if (isGroupLink && !isAllowed) {
    const groupMetadata = await client.groupMetadata(m.chat).catch(() => null)
    const participants = groupMetadata?.participants || []
    const admins = participants.filter(p => p.admin).map(p => p.id)
    
    const isAdmin = admins.includes(m.sender)
    const isBotAdmin = admins.includes(botId)

    if (isAdmin) return // Los admins pueden pasar links
    if (!isBotAdmin) return // Si el bot no es admin, no puede borrar

    // Eliminar mensaje
    await client.sendMessage(m.chat, { delete: m.key })

    // Eliminar usuario
    const userName = m.pushName || 'Usuario'
    await client.sendMessage(m.chat, { text: `❖ *${userName}* ha sido eliminado.\n*Motivo:* Enviar enlaces no permitidos.` })
    await client.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
  }
}