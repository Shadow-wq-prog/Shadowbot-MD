/*
Plugin: Ping corregido
*/

export default {
    command: ['p', 'ping'],
    run: async (sock, m, { args }) => { // <--- Agregamos las llaves { } aquí
        // Obtenemos el ID del chat
        const from = m.key.remoteJid;
        
        // Calculamos la latencia de forma real
        const start = Date.now();
        const latencia = Date.now() - start;

        // ENVIAR MENSAJE
        await sock.sendMessage(from, { 
            text: `🚀 *Pong!*\n⏱️ Latencia: ${latencia}ms` 
        }, { quoted: m });
    }
}
