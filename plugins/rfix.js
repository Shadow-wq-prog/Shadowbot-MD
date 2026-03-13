/*
Creador: Shadow Flash
Bot: Sηαdοωβοτ
*/

import { exec } from 'child_process';
import { promisify } from 'util';
const execPromise = promisify(exec);

export default {
  command: ['rfix', 'rupdate'],
  run: async (sock, m, { args }) => { // Parámetros corregidos
    const from = m.key.remoteJid;
    try {
      await sock.sendMessage(from, { react: { text: '⚙️', key: m.key } });

      await execPromise('git fetch --all');
      await execPromise('git reset --hard origin/main');
      await execPromise('git pull');

      let msg = `*🚀 Sηαdοωβοτ: Reparación Completa*\n\n`;
      msg += `> Todos los archivos han sido sobrescritos desde GitHub.\n`;
      msg += `> *Owner:* Shadow Flash\n\n`;
      msg += `_Reiniciando sistema..._`;

      await sock.sendMessage(from, { text: msg }, { quoted: m });
      await sock.sendMessage(from, { react: { text: '✅', key: m.key } });

      setTimeout(() => { process.exit(); }, 2000);

    } catch (error) {
      await sock.sendMessage(from, { text: `❌ *Fallo:* ${error.message}` });
    }
  }
};
