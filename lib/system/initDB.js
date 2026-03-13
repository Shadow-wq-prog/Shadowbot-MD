/*
Creador: Shadow Flash
Bot: Sηαdοωβοτ
*/

const isNumber = (x) => typeof x === 'number' && !isNaN(x)

function initDB(m, client) {
  if (!m || !client) return
  
  const jid = client.user.id.split(':')[0] + '@s.whatsapp.net'

  // --- CONFIGURACIÓN GLOBAL DEL BOT ---
  const settings = global.db.data.settings[jid] ||= {}
  settings.self ??= false
  settings.prefijo ??= ['.', '/', '#']
  settings.id ??= '120363198641161536@newsletter'
  settings.nameid ??= 'Shadow Flash'
  settings.link ??= 'https://github.com/Shadowbot-MD'
  settings.banner ??= ''
  settings.icon ??= ''
  settings.currency ??= 'ShadowCoins'
  settings.namebot ??= 'Sηαdοωβοτ'
  settings.namebot2 ??= 'Shadow-MD'
  settings.namebot3 ??= 'Shadow Flash Bot'
  settings.owner ??= '51983564381' // Tu número

  // --- DATOS DEL USUARIO ---
  const user = global.db.data.users[m.sender] ||= {}
  user.name ??= m.pushName || 'Usuario'
  user.exp = isNumber(user.exp) ? user.exp : 0
  user.level = isNumber(user.level) ? user.level : 0
  user.coins = isNumber(user.coins) ? user.coins : 0
  user.bank = isNumber(user.bank) ? user.bank : 0
  user.inventory = Array.isArray(user.inventory) ? user.inventory : []
  user.characters = Array.isArray(user.characters) ? user.characters : []
  user.rwCooldown = isNumber(user.rwCooldown) ? user.rwCooldown : 0
  user.vip = isNumber(user.vip) ? user.vip : 0
  user.usedcommands = isNumber(user.usedcommands) ? user.usedcommands : 0
  user.pasatiempo ??= ''
  user.description ??= ''
  user.marry ??= ''
  user.genre ??= ''
  user.birth ??= ''

  // --- DATOS DEL CHAT (GRUPOS/PRIVADOS) ---
  const chat = global.db.data.chats[m.chat] ||= {}
  chat.users ||= {}
  chat.bannedGrupo ??= false
  chat.welcome ??= true
  chat.nsfw ??= false
  chat.adminonly ??= false
  chat.primaryBot ??= null
  chat.antilinks ??= false
  chat.personajesReservados ||= []

  // Datos específicos del usuario dentro de ese chat
  chat.users[m.sender] ||= {}
  chat.users[m.sender].bank = isNumber(chat.users[m.sender].bank) ? chat.users[m.sender].bank : 0
  chat.users[m.sender].dailyStreak = isNumber(chat.users[m.sender].dailyStreak) ? chat.users[m.sender].dailyStreak : 0

  // Inicializar otros objetos necesarios
  global.db.data.gachaVotes ||= {}
  global.db.data.gachaCooldowns ||= {}
} 

export default initDB;