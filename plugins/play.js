/*
Creador: Shadow Flash
Bot: Sηαdοωβοτ
*/

const yts = require('yt-search');
const ytdl = require('ytdl-core-high-quality');
const fs = require('fs');
const path = require('path');

module.exports = {
  command: ['play', 'musica', 'p'],
  run: async (sock, m, from, args) => {
    const text = args.join(' ');
    if (!text) return sock.sendMessage(from, { text: '✨ *Sηαdοωβοτ* - ¿Qué canción quieres escuchar?\n\n*Ejemplo:* .play Believer Imagine Dragons' }, { quoted: m });

    try {
      // 1. Buscamos el video en YouTube
      await sock.sendMessage(from, { react: { text: '🔍', key: m.key } });
      const search = await yts(text);
      const video = search.videos[0];

      if (!video) return sock.sendMessage(from, { text: '❌ No encontré esa canción.' });

      let info = `┏━━ ✨ *Sηαdοωβοτ PLAY* ✨ ━━┓\n`;
      info += `┃ ◈ *Título:* ${video.title}\n`;
      info += `┃ ◈ *Duración:* ${video.timestamp}\n`;
      info += `┃ ◈ *Vistas:* ${video.views}\n`;
      info += `┃ ◈ *Subido:* ${video.ago}\n`;
      info += `┗━━━━━━━━━━━━━━━━┛\n\n> ⏳ *Descargando audio...*`;

      // Enviamos la miniatura con la info
      await sock.sendMessage(from, { image: { url: video.thumbnail }, caption: info }, { quoted: m });

      // 2. Descargamos el audio
      const audioPath = path.join(__dirname, `temp_${Date.now()}.mp3`);
      const stream = ytdl(video.url, { filter: 'audioonly', quality: 'highestaudio' });
      const file = fs.createWriteStream(audioPath);

      stream.pipe(file);

      file.on('finish', async () => {
        // 3. Enviamos el audio al chat
        await sock.sendMessage(from, { 
          audio: fs.readFileSync(audioPath), 
          mimetype: 'audio/mpeg', 
          ptt: false 
        }, { quoted: m });

        // Borramos el archivo temporal para no llenar la memoria
        fs.unlinkSync(audioPath);
        await sock.sendMessage(from, { react: { text: '✅', key: m.key } });
      });

    } catch (error) {
      console.error(error);
      await sock.sendMessage(from, { text: `❌ *Error en Sηαdοωβοτ:* ${error.message}` });
    }
  }
};
