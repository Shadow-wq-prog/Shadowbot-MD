/*
Creador: Shadow Flash
Bot: Sηαdοωβοτ
*/

const yts = require('yt-search');
const ytdl = require('@distube/ytdl-core'); // <--- Nueva librería estable
const fs = require('fs');
const path = require('path');

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
      info += `┗━━━━━━━━━━━━━━━━┛\n\n> ⏳ *Descargando audio...*`;

      await sock.sendMessage(from, { image: { url: video.thumbnail }, caption: info }, { quoted: m });

      const audioPath = path.join(__dirname, `temp_${Date.now()}.mp3`);
      
      // Descarga usando la nueva librería
      const stream = ytdl(video.url, { 
          filter: 'audioonly', 
          quality: 'highestaudio',
          lang: 'es'
      });
      
      const file = fs.createWriteStream(audioPath);
      stream.pipe(file);

      file.on('finish', async () => {
        await sock.sendMessage(from, { 
          audio: fs.readFileSync(audioPath), 
          mimetype: 'audio/mpeg', 
          ptt: false 
        }, { quoted: m });

        fs.unlinkSync(audioPath);
        await sock.sendMessage(from, { react: { text: '✅', key: m.key } });
      });

    } catch (error) {
      console.error(error);
      await sock.sendMessage(from, { text: `❌ *Error en Sηαdοωβοτ:* ${error.message}` });
    }
  }
};
