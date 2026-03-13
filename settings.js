import fs from 'fs';
import chalk from 'chalk';

// --- CONFIGURACIÓN DE OWNER ---
global.owner = [  
  ['51983564381', 'Shadow Flash', true],
  ['5491140642242', 'NetherLord', true]
]

global.maintenanceUsers = ['51983564381', '5491140642242'] 
global.mods = ['51983564381']
global.prems = []

// --- CONFIGURACIÓN DEL BOT ---
global.botName = 'Sηαdοωβοτ'
global.prefix = '|'
global.sessionName = 'sessions' // Ajustado para que coincida con tu index.js
global.pairing_code = true

// --- VERSIONES ---
global.version = 'V1.4.0.4|Betaᵖªᵗᶜʰ'
global.internalVersion = 'V..1.0/50'
global.dev = '❀ Shadow Flash & SpaceNight ❀'

// --- APIS ---
global.api = {
  url: 'https://api.stellarwa.xyz',
  key: 'Alba070503'
}

global.APIs = {
  stellar: { url: "https://api.stellarwa.xyz", key: "Alba070503" },
  adonix: { url: "https://api-adonix.ultraplus.click", key: "Destroy" },
  delirius: { url: "https://api.delirius.store", key: null },
  xyro: { url: "https://api.xyro.site", key: null }
}

// --- MENSAJES ---
global.mess = {
  socket: '《✧》 Este comando solo puede ser ejecutado por un Socket.',
  admin: '《✧》 Este comando solo puede ser ejecutado por los Administradores del Grupo.',
  botAdmin: '《✧》 Este comando solo puede ser ejecutado si el Bot es Administrador.',
  owner: '《✧》 Este comando solo puede ser usado por mi Creador.',
  group: '《✧》 Este comando solo funciona en Grupos.',
  private: '《✧》 Este comando solo funciona en Chats Privados.'
}

// COMENTA O ELIMINA ESTO PARA DETENER EL SPAM:
/*
let file = import.meta.url
fs.watchFile(file, () => {
  fs.unwatchFile(file)
  console.log(chalk.redBright(`Update 'settings.js'`))
  import(`${file}?update=${Date.now()}`)
})
*/
