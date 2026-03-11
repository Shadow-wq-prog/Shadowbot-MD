export default {
    command: ['tagall', 'invocar', 'marca'],
    category: 'admin',
    isGroup: true,
    isAdmin: true,
    run: async (sock, m, args) => {
        const from = m.key.remoteJid;
        
        // Obtenemos los datos del grupo
        const groupMetadata = await sock.groupMetadata(from);
        const participants = groupMetadata.participants;
        
        // Mensaje personalizado o por defecto
        let texto = args.length > 0 ? args.join(' ') : '📣 ¡Atención grupo!';
        
        let mensaje = `*⚡ INVOCACIÓN GENERAL ⚡*\n\n`
        mensaje += `*📢 Mensaje:* ${texto}\n\n`
        mensaje += `*👤 Total:* ${participants.length}\n\n`

        // Creamos la lista de menciones visibles
        for (let mem of participants) {
            mensaje += `🔹 @${mem.id.split('@')[0]}\n`
        }

        mensaje += `\n*Shadowbot-MD* - Shadow Flash`

        // Enviamos con menciones para que a todos les suene el celular
        await sock.sendMessage(from, { 
            text: mensaje, 
            mentions: participants.map(a => a.id) 
        }, { quoted: m });
    }
};
