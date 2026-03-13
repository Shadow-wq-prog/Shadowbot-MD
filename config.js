import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'

// 👑 CONFIGURACIÓN DEL DUEÑO
global.owner = [
  ['51983564381', 'Shadow Flash', true], // Tu número real
  ['51900000000'] // Puedes añadir otro número aquí
]

// ⚡ CONFIGURACIÓN DE PREFIJOS (Multi-Prefix)
// El bot responderá a comandos que empiecen con: . ! # o /
global.prefix =  |

// 🤖 INFORMACIÓN DEL BOT
global.packname = 'Sηαdοωβοτ'
global.author = 'Shadow Flash'
global.botname = 'Sηαdοωβοτ-MD'

// 🛠️ MENSAJES DE ESTADO
global.wait = '⏳ Cargando... por favor espera.'
global.error = '❌ ¡Ups! Hubo un error.'

// --- NO TOCAR ESTA PARTE ---
let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  import(`${file}?update=${Date.now()}`)
})
