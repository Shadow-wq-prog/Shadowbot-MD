import os from 'os';

export default {
    command: ['infobot', 'status', 'bot'],
    category: 'main',
    run: async (sock, m, args) => {
        const from = m.key.remoteJid;
        
        // Calculamos el tiempo de actividad (Uptime)
        const uptime = process.uptime();
        const d = Math.floor(uptime / (24 * 60 * 60));
        const h = Math.floor((uptime / (60 * 60)) % 24);
        const m_time = Math.floor((uptime / 60) % 60);
        const s = Math.floor(uptime % 60);
        const uptimeString = `${d}d ${h}h ${m_time}m ${s}s`;

        // Datos de Memoria RAM
        const usedMemory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const totalMemory = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);

        let info = `*📊 ESTADO DE Sηαdοωβοτ*\n\n`;
        info += `*👤 Creador:* Shadow Flash\n`;
        info += `*⏳ Activo:* ${uptimeString}\n`;
        info += `*📟 RAM:* ${usedMemory} MB / ${totalMemory} GB\n`;
        info += `*📡 Plataforma:* Termux (Android)\n`;
        info += `*📚 Plugins:* 17 cargados\n\n`;
        info += `_Shadowbot-MD está listo para servir._`;

        await sock.sendMessage(from, { 
            text: info,
            contextInfo: {
                externalAdReply: {
                    title: 'Sηαdοωβοτ Online',
                    body: 'Sistema de control Shadow Flash',
                    sourceUrl: 'https://github.com/', // Puedes poner tu link de GitHub aquí
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: m });
    }
};
