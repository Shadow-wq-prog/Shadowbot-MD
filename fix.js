const { exec } = require('child_process');

module.exports = {
    command: ['fix', 'update', '¥fix'],
    run: async (sock, m, from, args) => {
        try {
            // Reaccionamos para que sepas que el bot leyó el comando
            await sock.sendMessage(from, { react: { text: '⏳', key: m.key } });

            const textFix = args.join(' ') || 'Mejoras generales';
            
            // Ejecutamos el comando de actualización
            exec('git fetch origin main && git reset --hard origin/main', async (err, stdout, stderr) => {
                if (err) {
                    await sock.sendMessage(from, { react: { text: '❌', key: m.key } });
                    return sock.sendMessage(from, { text: `❌ *Error de Git:* ${err.message}` });
                }

                await sock.sendMessage(from, { react: { text: '✅', key: m.key } });
                await sock.sendMessage(from, { 
                    text: `亗 *Sηαdοωβοτ Actualizado*\n\n🛠️ *Nota:* ${textFix}\n\n_Reiniciando para aplicar cambios..._` 
                });

                // Esperamos 2 segundos y cerramos el bot
                setTimeout(() => {
                    process.exit();
                }, 2000);
            });

        } catch (e) {
            console.error(e);
            await sock.sendMessage(from, { text: `❌ *Error Interno:* ${e.message}` });
        }
    }
};
