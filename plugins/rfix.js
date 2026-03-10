/*
Creador: Shadow Flash
Bot: Sηαdοωβοτ
*/

const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

module.exports = {
  command: ['rfix', 'rupdate'],
  run: async (sock, m, from) => {
    try {
      await sock.sendMessage(from, { react: { text: '⚙️', key: m.key } });

      // Forzar limpieza y descarga total
      await execPromise('git config user.email "bot@shadow.com"');
      await execPromise('git config user.name "ShadowFlashBot"');
      await execPromise('git fetch --all');
      await execPromise('git reset --hard origin/main');
      await execPromise('git pull');

      let msg = `*🚀 Sηαdοωβοτ: Reparación Completa*\n\n`;
      msg += `> Todos los archivos de GitHub han sido sobrescritos con éxito.\n`;
      msg += `> *Owner:* Shadow Flash\n\n`;
      msg += `_Reiniciando sistema..._`;

      await sock.sendMessage(from, { text: msg }, { quoted: m });
      await sock.sendMessage(from, { react: { text: '✅', key: m.key } });

      setTimeout(() => { process.exit(); }, 2000);

    } catch (error) {
      await sock.sendMessage(from, { text: `❌ *Fallo en reparación:* ${error.message}` });
    }
  }
};
