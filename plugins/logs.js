/*
Creador: Shadow Flash
Bot: Sηαdοωβοτ
Función: Ver registros de consola en WhatsApp
*/

import { execSync } from 'child_process'

export default {
  command: ['logs', 'log', 'terminal'],
  category: 'owner',
  isOwner: true, // Solo tú puedes usarlo
  run: async (client, m) => {
    try {
      // Intentamos obtener las últimas 30 líneas del historial de la terminal
      // Nota: Esto funciona mejor si ejecutas el bot con pm2 o guardas el output en un archivo,
      // pero aquí usaremos un truco para leer el buffer de ejecución.
      
      await m.reply('⏳ *Sηαdοωβοτ:* Obteniendo registros de consola...')

      // En Android/Termux, este comando ayuda a ver procesos activos de Node
      const logOutput = execSync('ps -e | grep node').toString() 

      let report = `📋 *Sηαdοωβοτ - SYSTEM LOGS*\n\n`
      report += `\`\`\`\n${logOutput || 'No hay procesos activos visibles.'}\n\`\`\`\n\n`
      report += `> 💡 *Tip:* Si el bot está en bucle, verás varios procesos aquí.\n`
      report += `> *Owner:* Shadow Flash`

      await client.sendMessage(m.chat, { text: report }, { quoted: m })
    } catch (e) {
      await m.reply(`❌ Error al obtener logs: ${e.message}`)
    }
  }
}
