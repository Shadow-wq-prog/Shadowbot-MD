import yts from 'yt-search';

const handler = {
    command: ['play', 'musica'],
    run: async (sock, m, { args }) => {
        const chat = m.key.remoteJid;
        if (!args.length) return sock.sendMessage(chat, { text: '¿Qué canción buscamos? Ejemplo: |play botita' }, { quoted: m });
        
        try {
            const res = await yts(args.join(' '));
            const video = res.videos[0];
            if (!video) return sock.sendMessage(chat, { text: 'No encontré resultados.' }, { quoted: m });

            const caption = `🎬 *Sηαdοωβοτ: PLAY*\n\n` +
                          `📌 *Título:* ${video.title}\n` +
                          `🕒 *Duración:* ${video.timestamp}\n` +
                          `🔗 *Link:* ${video.url}\n\n` +
                          `> Enviando información del video...`;

            await sock.sendMessage(chat, { 
                image: { url: video.thumbnail }, 
                caption: caption 
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            await sock.sendMessage(chat, { text: '❌ Error al buscar la canción.' }, { quoted: m });
        }
    }
};

export default handler;
