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
      if (!video) return m.reply('❌ No encontré resultados.');

      let info = `┏━━ ✨ *Sηαdοωβοτ PLAY* ✨ ━━┓\n`;
      info += `┃ ◈ *Título:* ${video.title}\n`;
      info += `┃ ◈ *Duración:* ${video.timestamp}\n`;
      info += `┗━━━━━━━━━━━━━━━━┛\n\n> ⏳ *Descargando de servidor seguro...*`;

      await sock.sendMessage(from, { image: { url: video.thumbnail }, caption: info }, { quoted: m });

      // --- INTENTO 1: API Directa ---
      try {
        const { data } = await axios.get(`https://api.siputzx.my.id/api/d/ytmp3?url=${video.url}`);
        if (data.data && data.data.dl) {
          return await sock.sendMessage(from, { audio: { url: data.data.dl }, mimetype: 'audio/mpeg' }, { quoted: m });
        }
      } catch (e) { console.log("Error API 1"); }

      // --- INTENTO 2: API de Respaldo ---
      try {
        const { data: data2 } = await axios.get(`https://api.zenkey.my.id/api/download/ytmp3?url=${video.url}&apikey=zenkey`);
        if (data2.result && data2.result.download_url) {
          return await sock.sendMessage(from, { audio: { url: data2.result.download_url }, mimetype: 'audio/mpeg' }, { quoted: m });
        }
      } catch (e) { console.log("Error API 2"); }

      // --- INTENTO 3: API Global ---
      const res = await axios.get(`https://api.lolhuman.xyz/api/ytplay?apikey=GataDios&query=${encodeURIComponent(video.title)}`);
      await sock.sendMessage(from, { audio: { url: res.data.result.audio.link }, mimetype: 'audio/mpeg' }, { quoted: m });
      
      await sock.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (error) {
      await sock.sendMessage(from, { text: `❌ *Sηαdοωβοτ:* Todos los servidores están saturados. Intenta con otra canción o más tarde.` });
    }
  }
};
