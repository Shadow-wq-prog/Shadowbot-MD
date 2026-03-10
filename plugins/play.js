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
    if (!text) return sock.sendMessage(from, { text: '✨ *Sηαdοωβοτ* - ¿Qué canción quieres?\n\n*Ejemplo:* .play Believer' }, { quoted: m });

    try {
      await sock.sendMessage(from, { react: { text: '🔍', key: m.key } });
      
      const search = await yts(text);
      const video = search.videos[0];

      if (!video) return sock.sendMessage(from, { text: '❌ No encontré resultados.' });

      let info = `┏━━ ✨ *Sηαdοωβοτ PLAY* ✨ ━━┓\n`;
      info += `┃ ◈ *Título:* ${video.title}\n`;
      info += `┃ ◈ *Duración:* ${video.timestamp}\n`;
      info += `┗━━━━━━━━━━━━━━━━┛\n\n> ⏳ *Enviando audio...*`;

      await sock.sendMessage(from, { image: { url: video.thumbnail }, caption: info }, { quoted: m });

      // Esta API es de las más resistentes actualmente
      const apiUrl = `https://api.daxz7.xyz/api/downloader/youtube/audio?url=${video.url}`;
      const { data } = await axios.get(apiUrl);
      
      if (data.status && data.result.url) {
        await sock.sendMessage(from, { 
          audio: { url: data.result.url }, 
          mimetype: 'audio/mpeg', 
          ptt: false 
        }, { quoted: m });
        await sock.sendMessage(from, { react: { text: '✅', key: m.key } });
      } else {
        throw new Error('Fallo en servidor principal');
      }

    } catch (error) {
      console.error(error);
      // Respaldo rápido con otra fuente
      try {
          const res = await axios.get(`https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(args[0] || text)}`);
          await sock.sendMessage(from, { audio: { url: res.data.data.dl }, mimetype: 'audio/mpeg' }, { quoted: m });
          await sock.sendMessage(from, { react: { text: '✅', key: m.key } });
      } catch (err) {
          await sock.sendMessage(from, { text: `❌ *Sηαdοωβοτ:* Los servidores de YouTube están bloqueando la descarga. Prueba con otra canción o intenta en un momento.` });
      }
    }
  }
};
