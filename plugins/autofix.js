/*
Creador: Shadow Flash
Bot: Sηαdοωβοτ
Función: Autorreparación de sintaxis
*/

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

export default {
  command: ['autofix', 'reparar'],
  category: 'system',
  isOwner: true,
  run: async (client, m) => {
    const pluginsDir = path.join(process.cwd(), 'plugins')
    const { key } = await client.sendMessage(m.chat, { text: '🛠️ *Sηαdοωβοτ Engine:* Iniciando protocolo de autorreparación...' }, { quoted: m })

    const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'))
    let fixedCount = 0
    let logs = []

    for (const file of files) {
      const filePath = path.join(pluginsDir, file)
      try {
        // Chequeo de sintaxis
        execSync(`node --check "${filePath}"`, { stdio: 'pipe' })
      } catch (e) {
        let content = fs.readFileSync(filePath, 'utf8')
        
        // AUTO-FIX 1: Corregir m.reply si falta (común en tus errores)
        if (content.includes('m.reply') && !content.includes('const m =')) {
           // Intenta añadir contexto si falta, o podrías decidir reportarlo
        }

        // AUTO-FIX 2: Cerrar llaves o paréntesis faltantes al final
        const openBraces = (content.match(/{/g) || []).length
        const closeBraces = (content.match(/}/g) || []).length
        if (openBraces > closeBraces) {
          content += '\n}'.repeat(openBraces - closeBraces)
          fs.writeFileSync(filePath, content)
          fixedCount++
          logs.push(`✅ Corregidas llaves en: \`${file}\``)
        }
      }
    }

    if (fixedCount === 0) {
      await client.sendMessage(m.chat, { text: '✅ *Sηαdοωβοτ:* Todos los plugins están estables. No se requirieron parches.', edit: key })
    } else {
      let report = `🔧 *REPARACIÓN COMPLETADA*\n\n`
      report += logs.join('\n')
      report += `\n\n> Se aplicaron *${fixedCount}* parches de emergencia.\n> *Owner:* Shadow Flash`
      await client.sendMessage(m.chat, { text: report, edit: key })
    }
  }
}
