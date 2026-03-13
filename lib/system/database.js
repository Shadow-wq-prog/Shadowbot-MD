/*
Creador: Shadow Flash
Bot: Sηαdοωβοτ (Motor SQLite3 Compatible con Termux)
*/

import path from 'path'
import _ from 'lodash'
import yargs from 'yargs/yargs'
import sqlite3 from 'sqlite3' // Cambiamos a sqlite3
import { open } from 'sqlite' // Helper para promesas
import fs from 'fs'
import chalk from 'chalk'

if (!fs.existsSync('./lib')) fs.mkdirSync('./lib')

global.opts = Object(yargs(process.argv.slice(2)).exitProcess(false).parse())

const dbPath = path.join(process.cwd(), 'lib', 'shadowbot.db')

// Abrimos la conexión (usando promesas para que sea más fácil)
const dbPromise = open({
  filename: dbPath,
  driver: sqlite3.Database
})

const db = await dbPromise;

// Crear tablas
await db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (key TEXT PRIMARY KEY, data TEXT);
  CREATE TABLE IF NOT EXISTS chats (id TEXT PRIMARY KEY, contenido TEXT);
  CREATE TABLE IF NOT EXISTS settings (clave TEXT PRIMARY KEY, valor TEXT);
`)

global.db = {
  data: { users: {}, chats: {}, settings: {} },
  READ: false
}

global.loadDatabase = async function loadDatabase() {
  if (global.db.READ) return global.db.data
  global.db.READ = true

  const usuarios = await db.all(`SELECT key, data FROM usuarios`)
  usuarios.forEach(row => { try { global.db.data.users[row.key] = JSON.parse(row.data) } catch {} })

  const chats = await db.all(`SELECT id, contenido FROM chats`)
  chats.forEach(row => { try { global.db.data.chats[row.id] = JSON.parse(row.contenido) } catch {} })

  const settings = await db.all(`SELECT clave, valor FROM settings`)
  settings.forEach(row => { try { global.db.data.settings[row.clave] = JSON.parse(row.valor) } catch {} })

  global.db.READ = false
  return global.db.data
}

global.saveDatabase = async function saveDatabase() {
  const { users, chats, settings } = global.db.data

  for (const [key, data] of Object.entries(users)) {
    await db.run(`INSERT OR REPLACE INTO usuarios (key, data) VALUES (?, ?)`, [key, JSON.stringify(data)])
  }
  for (const [id, contenido] of Object.entries(chats)) {
    await db.run(`INSERT OR REPLACE INTO chats (id, contenido) VALUES (?, ?)`, [id, JSON.stringify(contenido)])
  }
  for (const [clave, valor] of Object.entries(settings)) {
    await db.run(`INSERT OR REPLACE INTO settings (clave, valor) VALUES (?, ?)`, [clave, JSON.stringify(valor)])
  }
}

// Guardado automático cada 30 segundos
setInterval(async () => {
    await global.saveDatabase()
    console.log(chalk.cyan(`[ DB ] Datos sincronizados en shadowbot.db`))
}, 30000)

export default global.db
