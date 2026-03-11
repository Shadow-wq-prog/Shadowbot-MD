/*
Plugin: Ping corregido
*/

export default {
    command: ['p', 'ping'],
    run: async (sock, m, args) => {
        // Obtenemos el ID del chat correctamente
        const from = m.key.remoteJid;
        
        // Calculamos la latencia
        const start = Date.now();
        const latencia = Date.now() - start;

        // ENVIAR MENSAJE
        await sock.sendMessage(from, { 
            text: `🚀 *Pong!*\n⏱️ Latencia: ${latencia}ms` 
        }, { quoted: m });
    }
}
