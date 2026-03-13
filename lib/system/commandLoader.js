/*
Creador: Shadow Flash
Bot: Sηαdοωβοτ
*/

import fs from "fs"
import path from "path"
import chalk from "chalk"
import { fileURLToPath } from "url"
import syntaxerror from "syntax-error"
import { format } from 'util'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Carpeta donde están tus comandos
const pluginsFolder = path.join(__dirname, "../../plugins")

global.middlewares = {
  before: [],
  after: []
}

global.comandos = new Map()
global.plugins = {}

async function loadCommandsAndPlugins(dir = pluginsFolder) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    
    const items = fs.readdirSync(dir)

    for (const fileOrFolder of items) {
        const fullPath = path.join(dir, fileOrFolder)

        if (fs.lstatSync(fullPath).isDirectory()) {
            await loadCommandsAndPlugins(fullPath)
            continue
        }

        if (!fileOrFolder.endsWith(".js")) continue
        
        const code = fs.readFileSync(fullPath)
        const err = syntaxerror(code, fileOrFolder, {
            sourceType: "module",
            allowAwaitOutsideFunction: true
        })

        if (err) {
            console.error(chalk.red(`❌ Error de sintaxis en ${fileOrFolder}:\n${format(err)}`))
            continue
        }

        try {
            const modulePath = `file://${path.resolve(fullPath)}?update=${Date.now()}`
            const imported = await import(modulePath)
            const comando = imported.default
            const pluginName = fileOrFolder.replace(".js", "")

            global.plugins[pluginName] = imported

            // Manejo de Middlewares
            if (typeof imported.before === 'function' && !imported.default?.command) {
              global.middlewares.before.push(imported.before)
            }
            if (typeof imported.after === 'function' && !imported.default?.command) {
              global.middlewares.after.push(imported.after)
            }

            if (!comando?.command || typeof comando.run !== "function") continue

            // Registrar comandos en el Map global
            comando.command.forEach(cmd => {
                global.comandos.set(cmd.toLowerCase(), {
                    pluginName,
                    run: comando.run,
                    category: comando.category || "General",
                    isOwner: comando.isOwner || false,
                    isAdmin: comando.isAdmin || false,
                    botAdmin: comando.botAdmin || false,
                    isModeration: comando.isModeration || false,
                    isMaintenance: comando.isMaintenance || false,
                    info: comando.info || {}
                })
            })
        } catch (e) {
            console.error(chalk.red(`❌ Error cargando el plugin ${fileOrFolder}:`), e)
        }
    }
}

// Función para recargar archivos en tiempo real
globalThis.reload = async (_ev, filename) => {
    if (!filename.endsWith(".js")) return
    
    console.log(chalk.yellow(`⚙️ Sηαdοωβοτ: Recargando ${filename}...`))
    
    global.comandos.clear()
    global.middlewares.before = []
    global.middlewares.after = []
    
    await loadCommandsAndPlugins()
}

// Vigilar cambios en la carpeta plugins
fs.watch(pluginsFolder, (event, filename) => {
    if (filename) globalThis.reload(event, filename)
})

export default loadCommandsAndPlugins