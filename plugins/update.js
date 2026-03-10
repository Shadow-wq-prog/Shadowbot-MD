/*
Creador: Shadow Flash
Bot: Sηαdοωβοτ
Función: Actualizar desde GitHub automáticamente
*/

import { execSync } from 'child_process'

export default {
  command: ['update', 'actualizar', 'gitpull'],
  category: 'owner',
  isOwner: true,
  run: async (client, m) => {
    try {
      await m.reply('🚀 *Sηαdοωβοτ:* Iniciando actualización desde GitHub...')

      // Forzamos la actualización para limpiar errores locales
      const stdout = execSync('git fetch --all && git reset --hard origin/main').toString()

      let report = `✅ *Sηαdοωβοτ ACTUALIZADO*\n\n`
      report += `\`\`\`\n${stdout}\n\`\`\`\n`
      report += `\n> El bot se reiniciará en 3 segundos para aplicar los cambios.`

      await client.sendMessage(m.chat, { text: report }, { quoted: m })

      // Esperar un momento y cerrar el proceso para que el "while true" lo reinicie
      setTimeout(() => {
        process.exit()
      }, 3000)

    } catch (e) {
      // Si la rama no es 'main', intentamos con 'master'
      try {
        const stdoutMaster = execSync('git fetch --all && git reset --hard origin/master').toString()
        await m.reply(`✅ *Sηαdοωβοτ:* Actualizado desde rama 'master'.\n\n\`\`\`\n${stdoutMaster}\n\`\`\``)
        setTimeout(() => { process.exit() }, 3000)
      } catch (err2) {
        await m.reply(`❌ *Error de Git:* ${e.message}`)
      }
    }
  }
}
