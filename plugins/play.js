const yts = require('yt-search');
const axios = require('axios');

module.exports = {
  command: ['play', 'musica'],
  run: async (sock, m, from, args) => {
    const text = args.join(' ');
    if (!text) return sock.sendMessage(from, { text: '✨ *Sηαdοωβοτ* - ¿Qué buscas?\n*Ejemplo:* .play Believer' }, { quoted: m });

    try {
      await sock.sendMessage(from, { react: { text: '🔍', key: m.key } });
      const search = await yts(text);
      const video = search.videos[0];
      if (!video) return sock.sendMessage(from, { text: '❌ No lo encontré.' }, { quoted: m });

      let info = `┏━━ ✨ *Sηαdοωβοτ PLAY* ✨ ━━┓\n`;
      info += `┃ ◈ *Título:* ${video.title}\n`;
      info += `┃ ◈ *Duración:* ${video.timestamp}\n`;
      info += `┗━━━━━━━━━━━━━━━━┛\n\n> ⏳ *Procesando audio premium...*`;

      await sock.sendMessage(from, { image: { url: video.thumbnail }, caption: info }, { quoted: m });

      const apiRes = await axios.get(`https://api.aggelos-007.xyz/api/ytmp3?url=${video.url}`);
      const dl_url = apiRes.data.result.download_url || apiRes.data.result;

      await sock.sendMessage(from, { 
        audio: { url: dl_url }, 
        mimetype: 'audio/mpeg', 
        fileName: `${video.title}.mp3` 
      }, { quoted: m });

      await sock.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (error) {
      sock.sendMessage(from, { text: '❌ Error en los servidores de música. Intenta más tarde.' }, { quoted: m });
    }
  }
};
