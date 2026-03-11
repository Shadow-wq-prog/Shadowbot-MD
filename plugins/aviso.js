export default {
    command: ['aviso', 'hidetag', 'todos'],
    category: 'admin',
    isGroup: true,    // Solo funciona en grupos
    isAdmin: true,    // Solo los admins pueden usarlo
    run: async (sock, m, args) => {
        const from = m.key.remoteJid;
        
        // Obtenemos los metadatos del grupo para sacar la lista de participantes
        const groupMetadata = await sock.groupMetadata(from);
        const participants = groupMetadata.participants;

        // El texto del aviso será lo que escribas después del comando
        const texto = args.length > 0 ? args.join(' ') : '📢 ¡Atención a todos!';

        // Enviamos el mensaje mencionando a todos los participantes
        await sock.sendMessage(from, { 
            text: texto, 
            mentions: participants.map(a => a.id) 
        }, { quoted: m });
    }
};
