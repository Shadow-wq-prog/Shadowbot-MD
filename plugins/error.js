/*
Creador: Shadow Flash
Bot: Sηαdοωβοτ
*/

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

export default {
  command: ['error', 'check', 'debug'],
  category: 'system',
  isOwner: true,
  run: async (client, m) => {
    // Apuntamos a la carpeta 'plugins' que es la que usas en Shadowbot-MD
    const pluginsDir = path.join(process.cwd(), 'plugins')

    if (!fs.existsSync(pluginsDir)) {
      return client.sendMessage(m.chat, { text: '❌ No se encontró la carpeta de plugins en: ' + pluginsDir }, { quoted: m })
    }

    const { key } = await client.sendMessage(m.chat, { text: '🔍 *Sηαdοωβοτ Scanner:* Iniciando revisión de código...' }, { quoted: m })

    const getFilesRecursively = (dir) => {
      let results = []
      const list = fs.readdirSync(dir)
      list.forEach(file => {
        const filePath = path.join(dir, file)
        const stat = fs.statSync(filePath)
        if (stat && stat.isDirectory()) {
          results = results.concat(getFilesRecursively(filePath))
        } else if (file.endsWith('.js')) {
          results.push(filePath)
        }
      })
      return results
    }

    const allFiles = getFilesRecursively(pluginsDir)
    let errorsFound = []

    await client.sendMessage(m.chat, { 
      text: `🚀 Analizando *${allFiles.length}* archivos de *Sηαdοωβοτ*...`, 
      edit: key 
    })

    for (const filePath of allFiles) {
      const fileName = path.relative(process.cwd(), filePath)
      try {
        // Verifica si el archivo tiene errores de sintaxis sin ejecutarlo
        execSync(`node --check "${filePath}"`, { stdio: 'pipe' })
      } catch (e) {
        const fullError = e.stderr?.toString() || e.message
        const cleanError = fullError.split('\n').slice(0, 5).join('\n') // Solo los primeros 5 renglones para no saturar

        errorsFound.push({
          file: fileName,
          detail: cleanError.trim()
        })
      }
    }

    if (errorsFound.length === 0) {
      await client.sendMessage(m.chat, { 
        text: `✅ *¡Análisis Limpio!*\n\nSe revisaron *${allFiles.length}* archivos en la carpeta de plugins y no hay errores de sintaxis detectados.\n\n> 👤 *By: Shadow Flash*`, 
        edit: key 
      })
    } else {
      let report = `⚠️ *Sηαdοωβοτ - REPORT DE ERRORES*\n\n`
      report += `Se encontraron fallos en *${errorsFound.length}* de *${allFiles.length}* archivos:\n\n`

      errorsFound.forEach((err, i) => {
        report += `*${i + 1}. 📂 Archivo:* \`${err.file}\`\n`
        report += `*❌ Error:* \`\`\`\n${err.detail}\n\`\`\`\n`
        report += `──────────────────\n`
      })

      report += `\n> 👤 *Shadow Flash Dev System*`

      await client.sendMessage(m.chat, { text: report, edit: key })
    }
  }
}
