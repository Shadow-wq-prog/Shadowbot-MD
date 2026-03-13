import yts from 'yt-search';

const handler = {
    command: ['play', 'musica'],
    run: async (sock, m, { args }) => {
        if (!args[0]) return sock.sendMessage(m.key.remoteJid, { text: '¿Qué canción buscamos? Ejemplo: |play botita' }, { quoted: m });
        
        const chat = m.key.remoteJid;
        const res = await yts(args.join(' '));
        const video = res.videos[0];

        if (!video) return sock.sendMessage(chat, { text: 'No encontré nada.' }, { quoted: m });

        await sock.sendMessage(chat, { 
            image: { url: video.thumbnail }, 
            caption: `🎬 *Título:* ${video.title}\n🔗 *Link:* ${video.url}` 
        }, { quoted: m });
    }
};

export default handler;
