/*
Creador: Shadow Flash
Bot: Sηαdοωβοτ
Función: Enviar copia de seguridad de los plugins
*/

import fs from 'fs'
import { execSync } from 'child_process'
import path from 'path'

export default {
  command: ['backup', 'respaldo', 'copia'],
  category: 'owner',
  isOwner: true,
  run: async (client, m) => {
    try {
      await m.reply('📦 *Sηαdοωβοτ:* Preparando el respaldo de tus plugins...')

      const folderName = 'plugins'
      const zipName = `Backup_Shadowbot_${Date.now()}.zip`

      // Usamos el comando zip de Linux/Termux
      // Si no tienes zip instalado, el bot intentará usar una alternativa
      try {
          execSync(`zip -r ${zipName} ${folderName}`)
      } catch {
          // Si falla el comando zip, lo intentamos con tar (que viene por defecto)
          execSync(`tar -cvzf ${zipName.replace('.zip', '.tar.gz')} ${folderName}`)
          return await client.sendMessage(m.chat, { 
              document: fs.readFileSync(zipName.replace('.zip', '.tar.gz')), 
              mimetype: 'application/gzip', 
              fileName: zipName.replace('.zip', '.tar.gz'),
              caption: '✅ *Sηαdοωβοτ:* Respaldo creado con éxito (formato TAR.GZ)\n\n> 👤 *Owner:* Shadow Flash'
          }, { quoted: m })
      }

      // Enviar el archivo ZIP
      await client.sendMessage(m.chat, { 
          document: fs.readFileSync(zipName), 
          mimetype: 'application/zip', 
          fileName: zipName,
          caption: '✅ *Sηαdοωβοτ:* Aquí tienes la copia de seguridad de tus plugins.\n\n> 👤 *Owner:* Shadow Flash'
      }, { quoted: m })

      // Limpiar el archivo temporal para no llenar la memoria del cel
      fs.unlinkSync(zipName)

    } catch (e) {
      await m.reply(`❌ Error al crear el backup: ${e.message}\n\n💡 *Tip:* Asegúrate de tener instalado 'zip' en Termux usando: pkg install zip`)
    }
  }
}
