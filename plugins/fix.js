/*
Creador: Shadow Flash
Bot: Sηαdοωβοτ
*/

import { exec } from 'child_process';
import { promisify } from 'util';
const execPromise = promisify(exec);

export default {
  command: ['fix', 'update'],
  run: async (sock, m) => {
    const from = m.key.remoteJid;
    
    try {
      // Reacción de espera
      await sock.sendMessage(from, { react: { text: '⏳', key: m.key } });

      // Verificar actualizaciones en GitHub
      await execPromise('git fetch origin main');
      const { stdout: local } = await execPromise('git rev-parse HEAD');
      const { stdout: remote } = await execPromise('git rev-parse origin/main');

      // Si ya está actualizado, solo refresca el proceso
      if (local.trim() === remote.trim()) {
          await sock.sendMessage(from, { react: { text: '✅', key: m.key } });
          return sock.sendMessage(from, { text: '✨ *Sηαdοωβοτ* ya está actualizado en su última versión.' }, { quoted: m });
      }

      // Obtener detalles de los cambios
      const { stdout: filesChanged } = await execPromise('git diff --name-only HEAD..origin/main');
      
      // Aplicar actualización forzada (ignora cambios locales para evitar conflictos)
      await execPromise('git reset --hard origin/main');
      
      // Instalar dependencias nuevas si las hay (ignora scripts pesados)
      await execPromise('npm install --ignore-scripts');

      const fileList = filesChanged.trim().split('\n').filter(f => f).map(f => `• ${f}`).slice(0, 10).join('\n');
      const totalFiles = filesChanged.trim().split('\n').filter(f => f).length;

      let msg = `*亗 Sηαdοωβοτ Actualizado*\n\n`;
      msg += `*Owner:* Shadow Flash\n`;
      msg += `*Cambios:* ${totalFiles} archivos\n\n`;
      msg += `*✎ Detalles:*\n${fileList}${totalFiles > 10 ? '\n...entre otros.' : ''}\n\n`;
      msg += `> El bot se reiniciará automáticamente para aplicar los cambios.`;

      await sock.sendMessage(from, { react: { text: '✅', key: m.key } });
      await sock.sendMessage(from, { text: msg }, { quoted: m });

      // Reiniciar proceso (PM2 lo levantará de nuevo)
      setTimeout(() => { process.exit(); }, 3000);

    } catch (error) {
      console.error(error);
      await sock.sendMessage(from, { react: { text: '❌', key: m.key } });
      await sock.sendMessage(from, { text: `❌ *ERROR EN FIX:* ${error.message}` }, { quoted: m });
    }
  }
};
