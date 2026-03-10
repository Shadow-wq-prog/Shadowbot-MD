const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

module.exports = {
    command: ['fix', 'update', '¥fix'],
    run: async (sock, m, from, args) => {
        try {
            // Reacción de "espera"
            await sock.sendMessage(from, { react: { text: '⏳', key: m.key } });

            // 1. Sincronizar con GitHub
            await execPromise('git fetch origin main');

            // 2. Revisar si hay cambios reales
            const { stdout: local } = await execPromise('git rev-parse HEAD');
            const { stdout: remote } = await execPromise('git rev-parse origin/main');

            if (local.trim() === remote.trim()) {
                await sock.sendMessage(from, { react: { text: '✅', key: m.key } });
                return sock.sendMessage(from, { text: '✨ *Sηαdοωβοτ* ya está en su última versión.' }, { quoted: m });
            }

            // 3. Obtener info de quién editó y qué archivos cambian
            const { stdout: info } = await execPromise('git log HEAD..origin/main --format="%an" -1');
            const { stdout: filesChanged } = await execPromise('git diff --name-only HEAD..origin/main');

            // 4. Aplicar los cambios (Reset Hard)
            await execPromise('git reset --hard origin/main');

            // 5. Preparar el reporte épico
            const totalFiles = filesChanged.trim().split('\n').filter(f => f).length;
            const fileList = filesChanged.trim().split('\n').filter(f => f).map(f => `• ${f}`).slice(0, 10).join('\n');

            let msg = `┏━━━ 亗 *ACTUALIZACIÓN* 亗 ━━━┓\n┃\n`;
            msg += `┃ 👤 *Editor:* ${info.trim()}\n`;
            msg += `┃ 📦 *Archivos:* ${totalFiles}\n`;
            msg += `┃\n┣━━━ ✎ *DETALLES* ━━━\n`;
            msg += `${fileList}${totalFiles > 10 ? '\n...entre otros.' : ''}\n┃\n`;
            msg += `┗━━━━━━━━━━━━━━━━┛\n\n_Reiniciando para aplicar cambios..._`;

            await sock.sendMessage(from, { react: { text: '✅', key: m.key } });
            await sock.sendMessage(from, { text: msg }, { quoted: m });

            // 6. Reiniciar proceso
            setTimeout(() => {
                process.exit();
            }, 3000);

        } catch (error) {
            console.error(error);
            await sock.sendMessage(from, { react: { text: '❌', key: m.key } });
            await sock.sendMessage(from, { text: `*❌ ERROR:* ${error.message}` });
        }
    }
};
