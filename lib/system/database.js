/*
Creador: Shadow Flash
Bot: Sηαdοωβοτ (Motor SQLite3)
Aviso: Este sistema mejora el rendimiento en dispositivos móviles.
*/

import path from 'path'
import _ from 'lodash'
import yargs from 'yargs/yargs'
import Database from 'better-sqlite3'
import fs from 'fs'

// Asegurar que la carpeta lib existe
if (!fs.existsSync('./lib')) fs.mkdirSync('./lib')

global.opts = Object(yargs(process.argv.slice(2)).exitProcess(false).parse())

// Ruta de la base de datos
const dbPath = path.join(process.cwd(), 'lib', 'shadowbot.db')

const conn = new Database(dbPath, { fileMustExist: false, timeout: 10000 })

// Modo WAL para mayor velocidad de escritura en Termux
conn.pragma('journal_mode = WAL')

// Creación de tablas iniciales
conn.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    key TEXT PRIMARY KEY,
    data TEXT
  );
  CREATE TABLE IF NOT EXISTS chats (
    id TEXT PRIMARY KEY,
    contenido TEXT
  );
  CREATE TABLE IF NOT EXISTS settings (
    clave TEXT PRIMARY KEY,
    valor TEXT
  );
`)

global.db = {
  conn,
  data: {
    users: {},
    chats: {},
    settings: {},
  },
  chain: null,
  READ: false,
  _snapshot: {
    users: '{}',
    chats: '{}',
    settings: '{}',
  },
}

global.DATABASE = global.db

global.loadDatabase = function loadDatabase() {
  if (global.db.READ) return global.db.data
  global.db.READ = true

  try {
    const usuarios = conn.prepare(`SELECT key, data FROM usuarios`).all()
    for (const row of usuarios) {
      try { global.db.data.users[row.key] = JSON.parse(row.data) } catch {}
    }

    const chats = conn.prepare(`SELECT id, contenido FROM chats`).all()
    for (const row of chats) {
      try { global.db.data.chats[row.id] = JSON.parse(row.contenido) } catch {}
    }

    const settings = conn.prepare(`SELECT clave, valor FROM settings`).all()
    for (const row of settings) {
      try { global.db.data.settings[row.clave] = JSON.parse(row.valor) } catch {}
    }
  } catch (e) {
    console.error("Error al cargar SQLite:", e)
  }

  global.db.chain = _.chain(global.db.data)
  global.db.READ = false

  global.db._snapshot.users = JSON.stringify(global.db.data.users)
  global.db._snapshot.chats = JSON.stringify(global.db.data.chats)
  global.db._snapshot.settings = JSON.stringify(global.db.data.settings)

  return global.db.data
}

function hasPendingChanges() {
  const { users, chats, settings } = global.db.data
  const snap = global.db._snapshot

  return (
    snap.users !== JSON.stringify(users) ||
    snap.chats !== JSON.stringify(chats) ||
    snap.settings !== JSON.stringify(settings)
  )
}

global.saveDatabase = function saveDatabase() {
  if (!hasPendingChanges()) return

  const { users, chats, settings } = global.db.data

  // Usamos transacciones para que sea ultra rápido
  const updateUsers = conn.transaction((data) => {
    const insert = conn.prepare(`REPLACE INTO usuarios (key, data) VALUES (?, ?)`)
    for (const [key, val] of Object.entries(data)) insert.run(key, JSON.stringify(val))
  })

  const updateChats = conn.transaction((data) => {
    const insert = conn.prepare(`REPLACE INTO chats (id, contenido) VALUES (?, ?)`)
    for (const [id, cont] of Object.entries(data)) insert.run(id, JSON.stringify(cont))
  })

  const updateSettings = conn.transaction((data) => {
    const insert = conn.prepare(`REPLACE INTO settings (clave, valor) VALUES (?, ?)`)
    for (const [clave, valor] of Object.entries(data)) insert.run(clave, JSON.stringify(valor))
  })

  updateUsers(users)
  updateChats(chats)
  updateSettings(settings)

  global.db._snapshot.users = JSON.stringify(users)
  global.db._snapshot.chats = JSON.stringify(chats)
  global.db._snapshot.settings = JSON.stringify(settings)
}

// Guardado automático cada 10 segundos si hay cambios
setInterval(() => {
  if (hasPendingChanges()) {
    global.saveDatabase()
    console.log(chalk.cyan(`[ DB ] Datos guardados en SQLite.`))
  }
}, 10000)

export default global.db
