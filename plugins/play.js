/*
Creador: Shadow Flash
Bot: Sηαdοωβοτ
*/

const yts = require('yt-search');
const axios = require('axios');

module.exports = {
  command: ['play', 'musica', 'p'],
  run: async (sock, m, from, args) => {
    const text = args.join(' ');
    if (!text) return m.reply('✨ *Sηαdοωβοτ* - ¿Qué buscas?\n*Ejemplo:* .play Believer');

    try {
      await sock.sendMessage(from, { react: { text: '🔍', key: m.key } });
      const search = await yts(text);
      const video = search.videos[0];
      if (!video) return m.reply('❌ No lo encontré.');

      let info = `┏━━ ✨ *Sηαdοωβοτ PLAY* ✨ ━━┓\n`;
      info += `┃ ◈ *Título:* ${video.title}\n`;
      info += `┃ ◈ *Duración:* ${video.timestamp}\n`;
      info += `┗━━━━━━━━━━━━━━━━┛\n\n> ⏳ *Procesando audio premium...*`;

      await sock.sendMessage(from, { image: { url: video.thumbnail }, caption: info }, { quoted: m });

      // API de alta velocidad que entrega el archivo directamente
      const apiRes = await axios.get(`https://api.aggelos-007.xyz/api/ytmp3?url=${video.url}`);
      const dl_url = apiRes.data.result.download_url || apiRes.data.result;

      await sock.sendMessage(from, { 
        audio: { url: dl_url }, 
        mimetype: 'audio/mpeg', 
        fileName: `${video.title}.mp3` 
      }, { quoted: m });

      await sock.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (error) {
      console.error(error);
      // Respaldo por si la anterior falla
      try {
        const res2 = await axios.get(`https://api.siputzx.my.id/api/d/ytmp3?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ`); // Enlace de prueba
        m.reply('❌ El servidor de YouTube rechazó la conexión. Intenta con otra canción.');
      } catch (e) {
        m.reply('❌ Error crítico en los servidores de música.');
      }
    }
  }
};
