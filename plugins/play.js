/*
Creador: Shadow Flash
Bot: Sηαdοωβοτ
*/

const yts = require('yt-search');
const axios = require('axios');

module.exports = {
  command: ['play', 'musica'],
  run: async (sock, m, from, args) => {
    const text = args.join(' ');
    if (!text) return sock.sendMessage(from, { text: '✨ *Sηαdοωβοτ* - ¿Qué canción quieres?\n\n*Ejemplo:* .play Believer' }, { quoted: m });

    try {
      await sock.sendMessage(from, { react: { text: '🔍', key: m.key } });
      
      const search = await yts(text);
      const video = search.videos[0];

      if (!video) return sock.sendMessage(from, { text: '❌ No encontré nada.' });

      let info = `┏━━ ✨ *Sηαdοωβοτ PLAY* ✨ ━━┓\n`;
      info += `┃ ◈ *Título:* ${video.title}\n`;
      info += `┃ ◈ *Duración:* ${video.timestamp}\n`;
      info += `┗━━━━━━━━━━━━━━━━┛\n\n> ⏳ *Descargando audio via Sηαdοωβοτ...*`;

      await sock.sendMessage(from, { image: { url: video.thumbnail }, caption: info }, { quoted: m });

      // Usamos una API externa para evitar los bloqueos de YouTube en Termux
      const apiUrl = `https://api.zenkey.my.id/api/download/ytmp3?url=${video.url}&apikey=zenkey`;
      const response = await axios.get(apiUrl);
      
      if (response.data.status && response.data.result.download_url) {
        await sock.sendMessage(from, { 
          audio: { url: response.data.result.download_url }, 
          mimetype: 'audio/mpeg', 
          ptt: false 
        }, { quoted: m });
        await sock.sendMessage(from, { react: { text: '✅', key: m.key } });
      } else {
        throw new Error('La API de descarga falló.');
      }

    } catch (error) {
      console.error(error);
      // Intento de respaldo con otra API si la primera falla
      try {
          const fallbackUrl = `https://api.lolhuman.xyz/api/ytplay?apikey=GataDios&query=${encodeURIComponent(text)}`;
          const res = await axios.get(fallbackUrl);
          await sock.sendMessage(from, { audio: { url: res.data.result.audio.link }, mimetype: 'audio/mpeg', ptt: false }, { quoted: m });
          await sock.sendMessage(from, { react: { text: '✅', key: m.key } });
      } catch (err2) {
          await sock.sendMessage(from, { text: `❌ *Sηαdοωβοτ:* YouTube está muy pesado hoy. Intenta más tarde.` });
      }
    }
  }
};
