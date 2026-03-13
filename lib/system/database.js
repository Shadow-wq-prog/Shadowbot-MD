import { join } from 'path'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import fs from 'fs'

const file = join(process.cwd(), 'database.json')
const adapter = new JSONFile(file)
const db = new Low(adapter, { users: {}, chats: {}, settings: {} })

global.db = db

global.loadDatabase = async function loadDatabase() {
  if (global.db.data) return global.db.data
  await global.db.read()
  global.db.data = {
    users: global.db.data?.users || {},
    chats: global.db.data?.chats || {},
    settings: global.db.data?.settings || {},
    ...(global.db.data || {})
  }
  return global.db.data
}

global.saveDatabase = async function saveDatabase() {
  if (global.db.data) await global.db.write()
}

await global.loadDatabase()

setInterval(async () => {
    if (global.db.data) await global.saveDatabase()
}, 60000) // Guarda cada minuto para evitar lag

export default global.db
