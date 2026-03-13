/*
Creador: Shadow Flash
Bot: Sηαdοωβοτ
*/

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

export default {
  command: ['error', 'debug', 'check'],
  category: 'system',
  isOwner: false, // Solo tú puedes usarlo
  run: async (client, m, { args }) => {
    const from = m.key.remoteJid
    
    try {
      // 1. Enviamos mensaje de inicio
      const { key } = await client.sendMessage(from, { text: '✨ *Sηαdοωβοτ:* Iniciando diagnóstico de sistema...' }, { quoted: m })

      const directories = [
        path.join(process.cwd(), 'plugins'),
        path.join(process.cwd(), 'lib')
      ]

      let allFiles = []
      
      // Función para listar archivos de forma segura
      for (const dir of directories) {
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'))
          files.forEach(f => allFiles.push(path.join(dir, f)))
        }
      }

      await client.sendMessage(from, { text: `🔍 Analizando *${allFiles.length}* archivos clave...`, edit: key })

      let errorsFound = []

      // 2. Escaneo de sintaxis con Node
      for (const filePath of allFiles) {
        const fileName = path.relative(process.cwd(), filePath)
        try {
          execSync(`node --check "${filePath}"`, { stdio: 'pipe' })
        } catch (e) {
          const fullError = e.stderr?.toString() || e.message
          errorsFound.push({
            file: fileName,
            detail: fullError.split('\n').slice(0, 3).join('\n') // Solo lo más importante
          })
        }
      }

      // 3. Resultado final
      if (errorsFound.length === 0) {
        await client.sendMessage(from, { 
          text: `✅ *Sηαdοωβοτ está limpio.*\n\nSe analizaron ${allFiles.length} archivos y no se encontraron errores de sintaxis.`, 
          edit: key 
        })
      } else {
        let report = `⚠️ *ERRORES ENCONTRADOS*\n\n`
        errorsFound.forEach((err, i) => {
          report += `*${i + 1}.* \`${err.file}\`\n\`\`\`${err.detail}\`\`\`\n──────────────\n`
        })
        await client.sendMessage(from, { text: report, edit: key })
      }

    } catch (globalError) {
      // Si el comando mismo falla, esto te avisará por qué
      console.error(globalError)
      await client.sendMessage(from, { text: `❌ *Fallo crítico en el comando error:* \n${globalError.message}` }, { quoted: m })
    }
  }
}
