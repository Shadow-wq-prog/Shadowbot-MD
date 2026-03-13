
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
    // Definimos las carpetas que queremos escanear para Sηαdοωβοτ
    const directoriesToScan = [
      path.join(process.cwd(), 'plugins'),
      path.join(process.cwd(), 'lib')
    ]

    const { key } = await client.sendMessage(m.chat, { text: '*🔍 Sηαdοωβοτ: Iniciando escaneo de sintaxis...*' }, { quoted: m })

    const getFilesRecursively = (dir) => {
      if (!fs.existsSync(dir)) return []
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

    let allFiles = []
    directoriesToScan.forEach(dir => {
      allFiles = allFiles.concat(getFilesRecursively(dir))
    })

    let errorsFound = []

    await client.sendMessage(m.chat, { 
      text: `Analizando *${allFiles.length}* archivos de sistema...`, 
      edit: key 
    })

    for (const filePath of allFiles) {
      const fileName = path.relative(process.cwd(), filePath)
      try {
        // Verifica si el código JS tiene errores sin ejecutarlo
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
        text: `*✅ ¡Análisis completo de Sηαdοωβοτ!*\n\nSe revisaron *${allFiles.length}* archivos y todo está en orden.`, 
        edit: key 
      })
    } else {
      let report = `*⚠️ ERRORES DETECTADOS EN Sηαdοωβοτ*\n\n`

      errorsFound.forEach((err, i) => {
        report += `*${i + 1}. Archivo:* \`${err.file}\`\n`
        report += `*Error:*\n\`\`\`\n${err.detail}\n\`\`\`\n`
        report += `──────────────\n`
      })

      report += `\n*Total de fallos:* ${errorsFound.length}`

      try {
        await client.sendMessage(m.chat, { text: report, edit: key })
      } catch {
        await m.reply(report)
      }
    }
  }
}
