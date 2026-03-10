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

      // Actualizar desde GitHub
      await execPromise('git fetch origin main');
      const { stdout: local } = await execPromise('git rev-parse HEAD');
      const { stdout: remote } = await execPromise('git rev-parse origin/main');

      if (local.trim() === remote.trim()) {
          await sock.sendMessage(from, { react: { text: '✅', key: m.key } });
          return sock.sendMessage(from, { text: 'ꕥ *Sηαdοωβοτ* ya está en su última versión.' });
      }

      const { stdout: filesChanged } = await execPromise('git diff --name-only HEAD..origin/main');
      await execPromise('git reset --hard origin/main');

      const totalFiles = filesChanged.trim().split('\n').length;

      let msg = `_亗 Sηαdοωβοτ Actualizado_\n`;
      msg += `*Owner:* Shadow Flash\n`;
      msg += `*Archivos nuevos:* ${totalFiles}\n\n`;
      msg += `> Reinstalando componentes...`;

      await sock.sendMessage(from, { react: { text: '✅', key: m.key } });
      await sock.sendMessage(from, { text: msg }, { quoted: m });

      // Reinicio automático para aplicar cambios
      setTimeout(() => {
          process.exit();
      }, 3000);

    } catch (error) {
      console.error(error);
      await sock.sendMessage(from, { react: { text: '❌', key: m.key } });
      await sock.sendMessage(from, { text: `*❌ ERROR EN Sηαdοωβοτ:* ${error.message}` });
    }
  }
};
