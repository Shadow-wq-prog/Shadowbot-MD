/*
Creador: Shadow Flash
Bot: Sηαdοωβοτ (Motor Estable para Termux)
*/

import { join } from 'path'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import lodash from 'lodash'
import fs from 'fs'
import chalk from 'chalk'

// Aseguramos que la carpeta exista
if (!fs.existsSync('./lib/system')) {
    fs.mkdirSync('./lib/system', { recursive: true })
}

const file = join(process.cwd(), 'database.json')
const adapter = new JSONFile(file)
const db = new Low(adapter, { users: {}, chats: {}, settings: {} })

global.db = db

// --- CARGA DE DATOS ---
global.loadDatabase = async function loadDatabase() {
  if (global.db.data) return global.db.data
  await global.db.read()
  
  // Estructura inicial para evitar errores de "undefined"
  global.db.data = {
    users: global.db.data?.users || {},
    chats: global.db.data?.chats || {},
    settings: global.db.data?.settings || {},
    ...(global.db.data || {})
  }
  
  global.db.chain = lodash.chain(global.db.data)
  return global.db.data
}

// --- GUARDADO DE DATOS ---
global.saveDatabase = async function saveDatabase() {
  // Solo guardamos si hay datos que guardar
  if (global.db.data) {
    await global.db.write()
  }
}

// Carga inmediata al importar el archivo
await global.loadDatabase()

// --- EL FIX DEL BUCLE (60 SEGUNDOS) ---
// Cambiamos el intervalo a 60000ms para evitar el spam de "Update settings.js"
let lastSave = Date.now()
setInterval(async () => {
    const now = Date.now()
    if (now - lastSave >= 60000) { // 1 minuto exacto
        await global.saveDatabase()
        lastSave = now
        console.log(chalk.greenBright(`\n[ ✿ ] Sηαdοωβοτ: Base de datos sincronizada correctamente.`))
    }
}, 10000) // Revisa internamente cada 10 seg, pero solo guarda cada minuto

export default global.db
