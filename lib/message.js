import { jidDecode } from '@whiskeysockets/baileys'

export function smsg(conn, m, store) {
  if (!m) return m
  let M = m.constructor
  if (m.key) {
    m.id = m.key.id
    m.isBaileys = m.id.startsWith('BAE5') && m.id.length === 16
    m.chat = m.key.remoteJid
    m.fromMe = m.key.fromMe
    m.isGroup = m.chat.endsWith('@g.us')
    m.sender = conn.decodeJid(m.fromMe && conn.user.id || m.participant || m.key.participant || m.chat || '')
  }
  if (m.message) {
    m.type = Object.keys(m.message)[0]
    m.body = m.message.conversation || m.message[m.type].caption || m.message[m.type].text || (m.type === 'listResponseMessage' && m.message[m.type].singleSelectReply.selectedRowId) || (m.type === 'buttonsResponseMessage' && m.message[m.type].selectedButtonId) || m.mtype
    m.msg = m.message[m.type]
  }
  return m
}

// Fix para el error de decodeJid
export function decodeJid(jid) {
  if (!jid) return jid
  if (/:\d+@/gi.test(jid)) {
    let decode = jidDecode(jid) || {}
    return decode.user && decode.server && decode.user + '@' + decode.server || jid
  } else return jid
}
