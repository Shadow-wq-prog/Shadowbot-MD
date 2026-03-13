/*
Creador: Shadow Flash
Bot: Sηαdοωβοτ
*/

import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'

const execPromise = promisify(exec)

export default {
  command: ['fix', 'refrescar'],
  isOwner: true,
  run: async (client, m) => {
    try {
      await client.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

      // Sincronizamos con la rama principal
      await execPromise('git fetch origin main')

      const { stdout: local } = await execPromise('git rev-parse HEAD')
      const { stdout: remote } = await execPromise('git rev-parse origin/main')

      // Si no hay cambios en GitHub, solo refrescamos la memoria de los comandos
      if (local.trim() === remote.trim()) {
          // Limpiamos los comandos actuales de la memoria global
          if (global.plugins) {
              for (let key in global.plugins) delete global.plugins[key]
          }
          
          await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
          return m.reply('ꕥ Sηαdοωβοτ ya está actualizado. Comandos refrescados en memoria.')
      }

      const { stdout: info } = await execPromise('git log HEAD..origin/main --format="%an" -1')
      const { stdout: filesChanged } = await execPromise('git diff --name-only HEAD..origin/main')

      // Aplicamos cambios de GitHub
      await execPromise('git reset --hard origin/main')

      // Limpieza de caché para recargar plugins nuevos
      global.plugins = {}

      const fileList = filesChanged.trim().split('\n').filter(f => f).map(f => `• ${f}`).slice(0, 15).join('\n')
      const totalFiles = filesChanged.trim().split('\n').length

      let msg = `_亗 Actualización de Sηαdοωβοτ Exitosa_\n`
      msg += `*Usuario:* ${info.trim() || 'Shadow Flash'}\n`
      msg += `*Archivos:* ${totalFiles}\n\n`
      msg += `*✎ Detalles:*\n${fileList}${totalFiles > 15 ? '\n...entre otros.' : ''}`

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
      await client.sendMessage(m.chat, { text: msg }, { quoted: m })

    } catch (error) {
      console.error(error)
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      await m.reply(`*❌ ERROR EN Sηαdοωβοτ:* ${error.message}`)
    }
  }
}