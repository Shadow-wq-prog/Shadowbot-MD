/*
Creador: Shadow Flash
Bot: Sηαdοωβοτ (Sistema JSON Stable para Termux)
*/

import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import lodash from 'lodash'
import fs from 'fs'
import chalk from 'chalk'

const __dirname = dirname(fileURLToPath(import.meta.url))
const file = join(process.cwd(), 'database.json')

const adapter = new JSONFile(file)
const db = new Low(adapter, { users: {}, chats: {}, settings: {} })

global.db = db

global.loadDatabase = async function loadDatabase() {
  if (global.db.data) return global.db.data
  await global.db.read()
  
  // Inicialización de seguridad
  global.db.data = {
    users: global.db.data?.users || {},
    chats: global.db.data?.chats || {},
    settings: global.db.data?.settings || {},
    ...(global.db.data || {})
  }
  
  global.db.chain = lodash.chain(global.db.data)
  return global.db.data
}

global.saveDatabase = async function saveDatabase() {
  await global.db.write()
}

// Carga inicial inmediata
await global.loadDatabase()

// Guardado automático cada 30 segundos si hay cambios
setInterval(async () => {
    await global.saveDatabase()
    console.log(chalk.green(`[ Sηαdοωβοτ ] Base de datos sincronizada.`))
}, 30000)

export default global.db
