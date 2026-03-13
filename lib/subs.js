/*
Creador: Shadow Flash
Bot: Sηαdοωβοτ (Sistema de Sub-bots)
*/

import {
  Browsers,
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  DisconnectReason,
  jidDecode,
} from '@whiskeysockets/baileys';
import NodeCache from 'node-cache';
import handler from '../handler.js'
import events from '../commands/events.js'
import pino from 'pino';
import fs from 'fs';
import chalk from 'chalk';
import { smsg } from './message.js';
import moment from 'moment-timezone';

if (!global.conns) global.conns = []
const msgRetryCounterCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
const userDevicesCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
const groupCache = new NodeCache({ stdTTL: 3600, checkperiod: 300 });
let reintentos = {}

const cleanJid = (jid = '') => jid.replace(/:\d+/, '').split('@')[0]

export async function startSubBot(m, client, caption = '', isCode = false, phone = '', chatId = '', commandFlags = {}, isCommand = false) {
  const id = phone || (m?.sender || '').split('@')[0]
  const sessionFolder = `./Sessions/Subs/${id}`
  const senderId = m?.sender

  const { state, saveCreds } = await useMultiFileAuthState(sessionFolder)
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: Browsers.macOS('Chrome'),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
    },
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true,
    syncFullHistory: false,
    getMessage: async () => '',
    msgRetryCounterCache,
    userDevicesCache,
    cachedGroupMetadata: async (jid) => groupCache.get(jid),
    version,
    keepAliveIntervalMs: 60_000,
  })

  sock.isInit = false
  sock.ev.on('creds.update', saveCreds)

  sock.decodeJid = (jid) => {
    if (!jid) return jid
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {}
      return (decode.user && decode.server && decode.user + '@' + decode.server) || jid
    } else return jid
  }

  sock.ev.on('connection.update', async ({ connection, lastDisconnect, isNewLogin, qr }) => {
    if (isNewLogin) sock.isInit = false

    if (connection === 'open') {
      sock.uptime = Date.now();
      sock.isInit = true
      sock.userId = cleanJid(sock.user?.id?.split('@')[0])
      
      const botDir = sock.userId + '@s.whatsapp.net'
      if (!global.db.data.settings[botDir]) global.db.data.settings[botDir] = {}
      
      global.db.data.settings[botDir].type = 'Sub'
      if (!global.conns.find((c) => c.userId === sock.userId)) global.conns.push(sock)

      delete reintentos[sock.userId || id]
      console.log(chalk.green(`[ Sηαdοωβοτ ] SUB-BOT conectado: ${sock.userId}`))
    }

    if (connection === 'close') {
      const botId = sock.userId || id
      const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.reason || 0
      const intentos = reintentos[botId] || 0
      reintentos[botId] = intentos + 1

      if ([401, 403].includes(reason)) {
        if (intentos < 5) {
          setTimeout(() => startSubBot(m, client, caption, isCode, phone, chatId, {}, isCommand), 3000)
        } else {
          try { fs.rmSync(sessionFolder, { recursive: true, force: true }) } catch {}
          delete reintentos[botId]
        }
        return
      }
      setTimeout(() => startSubBot(m, client, caption, isCode, phone, chatId, {}, isCommand), 5000)
    }

    // Lógica de Pairing Code para el Sub-Bot
    if (qr && isCode && phone && client && chatId && commandFlags[senderId]) {
      try {
        let codeGen = await sock.requestPairingCode(phone);
        codeGen = codeGen.match(/.{1,4}/g)?.join("-") || codeGen;
        const msg = await client.sendMessage(chatId, { text: caption }, { quoted: m })
        const msgCode = await client.sendMessage(chatId, { text: `*CÓDIGO:* ${codeGen}` }, { quoted: msg });
        delete commandFlags[senderId];
      } catch (err) {
        console.error("[Sub-Bot Error]", err);
      }
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return
    for (let raw of messages) {
      if (!raw.message) continue
      let msg = await smsg(sock, raw)
      try {
        handler(sock, msg, messages)
      } catch (err) {
        console.log(chalk.red(`[ Error Sub ] → ${err}`))
      }
    }
  })
 
  try {
    await events(sock, m)
  } catch (err) {
    console.log(chalk.gray(`[ Sub Events ] → ${err}`))
  }

  return sock
}

export function loadSubBots() {
  return global.conns || []
}