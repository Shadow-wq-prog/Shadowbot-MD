import {
  downloadContentFromMessage,
  getContentType,
  getDevice,
  extractMessageContent,
  areJidsSameUser,
  proto,
  generateWAMessage
} from '@whiskeysockets/baileys';
import chalk from 'chalk';
import fs from 'fs';
import axios from 'axios';
import moment from 'moment-timezone';
import { sizeFormatter } from 'human-readable';
import util from 'util';

export async function smsg(client, m, store) {
  if (!m) return m
  client.downloadMediaMessage = async (message) => {
    const msg = message.msg || message
    const mime = msg.mimetype || ''
    const messageType = (message.type || mime.split('/')[0]).replace(/Message/gi, '')
    const stream = await downloadContentFromMessage(msg, messageType)
    let buffer = Buffer.from([])
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk])
    }
    return buffer
  }

  if (m.key) {
    m.id = m.key.id
    m.chat = m.key.remoteJid
    m.fromMe = m.key.fromMe
    m.isGroup = m.chat.endsWith('@g.us')
    m.sender = client.decodeJid(m.fromMe && client.user.id || m.participant || m.key.participant || m.chat || '')
  }

  if (m.message) {
    m.type = getContentType(m.message) || Object.keys(m.message)[0]
    m.msg = extractMessageContent(m.message[m.type]) || m.message[m.type]
    m.body = m.message?.conversation || m.msg?.text || m.msg?.caption || m.msg?.selectedButtonId || ''
    m.text = m.body
    
    // Configuración de prefijo y comando básico
    m.prefix = /^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi.test(m.body) ? m.body.match(/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi)[0] : ''
    m.command = m.body && m.body.replace(m.prefix, '').trim().split(/ +/).shift()
    m.args = m.body?.trim().replace(m.command, '').split(/ +/).filter(a => a) || []
  }
  
  m.reply = (text) => client.sendMessage(m.chat, { text }, { quoted: m })
  return m
}