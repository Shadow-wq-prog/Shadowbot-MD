/*
Creador: Shadow Flash
Bot: Sηαdοωβοτ
*/

const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

module.exports = {
  command: ['fix', 'update'],
  run: async (sock, m, from) => {
    try {
      await sock.sendMessage(from, { react: { text: '⏳', key: m.key } });

      await execPromise('git fetch origin main');
      const { stdout: local } = await execPromise('git rev-parse HEAD');
      const { stdout: remote } = await execPromise('git rev-parse origin/main');

      if (local.trim() === remote.trim()) {
          await sock.sendMessage(from, { react: { text: '✅', key: m.key } });
          return sock.sendMessage(from, { text: '✨ *Sηαdοωβοτ* ya está actualizado.' });
      }

      // Obtener la lista de nombres de archivos que cambiaron
      const { stdout: filesChanged } = await execPromise('git diff --name-only HEAD..origin/main');
      await execPromise('git reset --hard origin/main');

      const fileList = filesChanged.trim().split('\n').map(f => `• ${f}`).join('\n');
      const total = filesChanged.trim().split('\n').length;

      let msg = `*亗 Sηαdοωβοτ Actualizado*\n\n`;
      msg += `*Owner:* Shadow Flash\n`;
      msg += `*Cambios:* ${total}\n\n`;
      msg += `*Archivos modificados:*\n${fileList}\n\n`;
      msg += `> Reinstalando componentes...`;

      await sock.sendMessage(from, { text: msg }, { quoted: m });
      await sock.sendMessage(from, { react: { text: '✅', key: m.key } });

      setTimeout(() => { process.exit(); }, 3000);

    } catch (error) {
      await sock.sendMessage(from, { text: `❌ *Error:* ${error.message}` });
    }
  }
};
