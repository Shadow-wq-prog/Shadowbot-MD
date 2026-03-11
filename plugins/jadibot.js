export default {
    command: ['jadibot', 'crearbot', 'serbot'],
    category: 'main',
    run: async (sock, m, args) => {
        const from = m.key.remoteJid;
        
        await sock.sendMessage(from, { 
            text: `⚡ *Sηαdοωβοτ CONEXIÓN* ⚡\n\nSolicitando código de vinculación... espera.` 
        }, { quoted: m });

        // Aquí iría la lógica de tu index para generar el Pairing Code
        // Para este comando, el bot le enviará al usuario las instrucciones
        // de cómo clonar el bot usando su propio número.
        
        let msg = `*¿Quieres tener tu propio Shadowbot?*\n\n`;
        msg += `1️⃣ Ve a los Ajustes de WhatsApp.\n`;
        msg += `2️⃣ Dispositivos vinculados.\n`;
        msg += `3️⃣ Vincular con código de teléfono.\n\n`;
        msg += `*Tu código de 8 dígitos es:*`;

        await sock.sendMessage(from, { text: msg }, { quoted: m });
        
        // El bot genera el código dinámicamente si tienes implementado el multi-auth
        const code = await sock.requestPairingCode(m.sender.split('@')[0]);
        await sock.sendMessage(from, { text: `🔑 *CÓDIGO:* ${code}` }, { quoted: m });
    }
};
