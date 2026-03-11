import fetch from 'node-fetch';

export default {
    command: ['ig', 'instagram', 'reels'],
    category: 'multimedia',
    run: async (sock, m, args) => {
        const from = m.key.remoteJid;
        if (!args[0]) return sock.sendMessage(from, { text: '⚠️ Envía un enlace de Instagram.' }, { quoted: m });

        await sock.sendMessage(from, { text: '⏳ Descargando contenido de Instagram...' }, { quoted: m });

        try {
            // Usando una API gratuita de descarga
            const api = await fetch(`https://api.lolhuman.xyz/api/instagram?apikey=GataDios&url=${args[0]}`);
            const res = await api.json();

            if (res.status !== 200) throw new Error('No se pudo obtener el contenido.');

            const result = res.result;

            // Si es un carrusel o varias fotos/videos
            if (Array.isArray(result)) {
                for (let url of result) {
                    await sock.sendMessage(from, { 
                        [url.includes('.mp4') ? 'video' : 'image']: { url: url },
                        caption: '✅ Aquí tienes tu descarga.'
                    }, { quoted: m });
                }
            } else {
                // Si es un solo video o foto
                await sock.sendMessage(from, { 
                    [result.includes('.mp4') ? 'video' : 'image']: { url: result },
                    caption: '✅ Aquí tienes tu descarga.'
                }, { quoted: m });
            }

        } catch (e) {
            console.error(e);
            await sock.sendMessage(from, { text: '❌ Error: El enlace es privado o no es válido.' }, { quoted: m });
        }
    }
};
