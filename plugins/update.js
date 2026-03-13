/*
Creador: Shadow Flash
Bot: Sηαdοωβοτ
*/

import { exec } from 'child_process'
import { promisify } from 'util'
import { writeFileSync } from 'fs' 
import path from 'path' 
import chalk from 'chalk' 

const execPromise = promisify(exec)

export default {
  command: ['rupdate', 'rfix'],
  isOwner: true,
  run: async (client, m) => {
    try {
      // Reacción de espera
      await client.sendMessage(m.chat, { react: { text: '🕑', key: m.key } })

      // Configuración interna de Git para evitar errores de identidad
      await execPromise('git config user.email "shadow@bot.com"')
      await execPromise('git config user.name "ShadowFlash"')
      
      // Sincronizar con GitHub
      await execPromise('git fetch origin')

      const { stdout: branch } = await execPromise('git rev-parse --abbrev-ref HEAD')
      const currentBranch = branch.trim()

      const { stdout: diffStatus } = await execPromise(`git diff --name-status HEAD..origin/${currentBranch}`).catch(() => ({ stdout: '' }))
      const { stdout: info } = await execPromise(`git log HEAD..origin/${currentBranch} --format="%an" -1`).catch(() => ({ stdout: 'Shadow Flash' }))

      const lines = diffStatus.trim().split('\n').filter(line => line.trim() !== '')
      const totalFiles = lines.length

      // Aplicar los cambios (Reset hard para limpiar errores locales)
      await execPromise(`git reset --hard origin/${currentBranch}`)

      let changeList = lines.map(line => {
        const [status, ...fileParts] = line.split(/\s+/)
        const file = fileParts.join(' ')
        switch (status) {
          case 'A': return `+ ${file}`
          case 'M': return `• ${file}`
          case 'D': return `- ${file}`
          default: return `? ${file}`
        }
      }).slice(0, 20).join('\n')

      let msg = `❀ *Actualización de Sηαdοωβοτ*\n\n`
      msg += `亗 *Editor:* ${info.trim()}\n`
      msg += `✎ *Total Cambios:* ${totalFiles}\n\n`

      if (totalFiles > 0) {
          msg += `ꕥ *Detalles de archivos:*\n\`\`\`${changeList}${totalFiles > 20 ? '\n...entre otros.' : ''}\`\`\`\n\n`
      } else {
          msg += `> *El bot ya se encuentra en su última versión.*\n\n`
      }

      msg += `> *Reiniciando Shadow-MD, por favor espere...*`

      await client.sendMessage(m.chat, { text: msg }, { quoted: m })
      await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

      console.log(chalk.greenBright(`✅ Shadow-MD actualizado, reiniciando.`)) 

      // Guardar base de datos si existe antes de cerrar
      if (global.db && global.db.write) await global.db.write()

      // Crear bandera de reinicio para el index.js
      const chatID = m.chat; 
      const filePath = path.join(process.cwd(), 'restart_flag.txt');
      writeFileSync(filePath, chatID); 

      // Salida limpia para que el monitor (npm start/node index) lo reinicie
      setTimeout(() => {
        process.exit(0)
      }, 3000)

    } catch (error) {
      console.error(error)
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      await m.reply(`*⚠️ FALLO CRÍTICO EN Sηαdοωβοτ:* \n\n${error.message}`)
    }
  }
}
