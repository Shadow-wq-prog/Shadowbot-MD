/*
Creador: Shadow Flash
Bot: Sηαdοωβοτ
*/

import { exec } from 'child_process';
import { promisify } from 'util';
const execPromise = promisify(exec);

export default {
  command: ['fix', 'update'],
  run: async (sock, m, { prefix, command }) => {
    const from = m.key.remoteJid;
    
    try {
      await sock.sendMessage(from, { react: { text: '⏳', key: m.key } });

      await execPromise('git fetch origin main');
      const { stdout: local } = await execPromise('git rev-parse HEAD');
      const { stdout: remote } = await execPromise('git rev-parse origin/main');

      if (local.trim() === remote.trim()) {
          await sock.sendMessage(from, { react: { text: '✅', key: m.key } });
          return sock.sendMessage(from, { text: '✨ *Sηαdοωβοτ* ya está actualizado.' });
      }

      // Obtener la lista de archivos que cambiaron
      const { stdout: filesChanged } = await execPromise('git diff --name-only HEAD..origin/main');
      await execPromise('git reset --hard origin/main');

      const files = filesChanged.trim().split('\n');
      const fileList = files.map(f => `• ${f}`).join('\n');
      const total = files.length;

      let msg = `*亗 Sηαdοωβοτ Actualizado*\n\n`;
      msg += `*Owner:* Shadow Flash\n`;
      msg += `*Cambios:* ${total}\n\n`;
      msg += `*Archivos modificados:*\n${fileList}\n\n`;
      msg += `> Reinstalando componentes y reiniciando...`;

      await sock.sendMessage(from, { text: msg }, { quoted: m });
      await sock.sendMessage(from, { react: { text: '✅', key: m.key } });

      // Reinicio automático para aplicar cambios
      setTimeout(() => { process.exit(); }, 3000);

    } catch (error) {
      await sock.sendMessage(from, { text: `❌ *Error:* ${error.message}` });
    }
  }
};
