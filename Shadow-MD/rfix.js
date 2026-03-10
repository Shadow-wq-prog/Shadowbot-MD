/*
Creador: Shadow Flash
Bot: Sηαdοωβοτ
*/

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const execPromise = promisify(exec);

module.exports = {
  command: ['rupdate', 'rfix'],
  run: async (sock, m, from) => {
    try {
      await sock.sendMessage(from, { react: { text: '⏳', key: m.key } });

      // Configuración de Git
      await execPromise('git config user.email "bot@shadow.com"');
      await execPromise('git config user.name "ShadowFlashBot"');
      
      await execPromise('git fetch origin');

      // Obtener rama actual y diferencias
      const { stdout: branch } = await execPromise('git rev-parse --abbrev-ref HEAD');
      const currentBranch = branch.trim();

      const { stdout: diffStatus } = await execPromise(`git diff --name-status HEAD..origin/${currentBranch}`).catch(() => ({ stdout: '' }));
      
      const lines = diffStatus.trim().split('\n').filter(line => line.trim() !== '');
      const totalFiles = lines.length;

      if (totalFiles === 0) {
          await sock.sendMessage(from, { react: { text: '✅', key: m.key } });
          return sock.sendMessage(from, { text: '> *Sηαdοωβοτ* ya se encuentra en su última versión.' }, { quoted: m });
      }

      // Resetear a la versión de la nube
      await execPromise(`git reset --hard origin/${currentBranch}`);

      let changeList = lines.map(line => {
        const [status, ...fileParts] = line.split(/\s+/);
        const file = fileParts.join(' ');
        switch (status) {
          case 'A': return `+ ${file}`; // Added
          case 'M': return `• ${file}`; // Modified
          case 'D': return `- ${file}`; // Deleted
          default: return `? ${file}`;
        }
      }).slice(0, 20).join('\n');

      let msg = `❀ *Sηαdοωβοτ: Actualización Exitosa*\n\n`;
      msg += `亗 *Editor:* Shadow Flash\n`;
      msg += `✎ *Total Cambios:* ${totalFiles}\n\n`;
      msg += `ꕥ *Detalles:*\n\`\`\`${changeList}${totalFiles > 20 ? '\n...entre otros.' : ''}\`\`\`\n\n`;
      msg += `> *Reiniciando para aplicar cambios...*`;

      await sock.sendMessage(from, { text: msg }, { quoted: m });
      await sock.sendMessage(from, { react: { text: '✅', key: m.key } });

      // Bandera de reinicio
      const filePath = path.join(process.cwd(), 'restart_flag.txt');
      fs.writeFileSync(filePath, from); 

      setTimeout(() => {
        process.exit(0);
      }, 3000);

    } catch (error) {
      console.error(error);
      await sock.sendMessage(from, { react: { text: '❌', key: m.key } });
      await sock.sendMessage(from, { text: `*⚠️ Sηαdοωβοτ - FALLO CRÍTICO:* \n\n${error.message}` });
    }
  }
};
