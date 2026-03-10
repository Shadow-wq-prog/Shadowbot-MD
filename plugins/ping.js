/*
Creador: Shadow flash 
https://chat.whatsapp.com/IyxuHbUdgvYBcVit6sThOO
*/

const os = require('os');
const fs = require('fs');
const path = require('path');

// Función para calcular el tamaño de la carpeta (ROM)
const getFolderSize = (dirPath) => {
  let size = 0;
  try {
    const files = fs.readdirSync(dirPath);
    for (let i = 0; i < files.length; i++) {
      const filePath = path.join(dirPath, files[i]);
      const stats = fs.statSync(filePath);
      if (stats.isFile()) size += stats.size;
      else if (stats.isDirectory() && !['node_modules', '.git', '.cache'].includes(files[i])) {
        size += getFolderSize(filePath);
      }
    }
  } catch (e) { return 0; }
  return size;
};

module.exports = {
  command: ["ping", "p"],
  run: async (sock, m, from, args) => {
    const start = Date.now();
    const userTag = m.pushName || 'Usuario';

    // Enviamos el mensaje de "Cargando"
    const { key } = await sock.sendMessage(from, { 
      text: `⌗°亗˚₊\n\`Usuario:\` *${userTag}*\n────────────────\n❀ *Cargando ping…*\n────────────────\n> Sηαdοωβοτ ⚡` 
    }, { quoted: m });

    const latency = Date.now() - start;
    
    // Cálculo de Uptime (Tiempo encendido)
    const up = process.uptime();
    const h = Math.floor(up / 3600);
    const min = Math.floor((up % 3600) / 60);
    const s = Math.floor(up % 60);
    const uptimeStr = `${h}h ${min}m ${s}s`;
    
    // Memoria RAM y ROM
    const ram = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const usedRom = (getFolderSize(process.cwd()) / 1024 / 1024).toFixed(2);

    let msg = `⌗°亗°₊\n\`Usuario:\` *${userTag}*\n`;
    msg += `────────────────\n`;
    msg += `❀ \`Ping:\` ${latency} ms\n`;
    msg += `ⴵ \`Uptime:\` [ ${uptimeStr} ]\n`;
    msg += `✥ \`RAM:\` ${ram} MB\n`;
    msg += `ꕥ \`ROM:\` ${usedRom} MB\n`;
    msg += `────────────────\n`;
    msg += `> Sηαdοωβοτ ⚡ powered 亗𝙽𝚎𝚝𝚑𝚎𝚛𝙻𝚘𝚛𝚍亗`;

    // Editamos el mensaje anterior con la info real
    await sock.sendMessage(from, { text: msg.trim(), edit: key });

    // Enviar audio si existe en la carpeta plugins
    const audioPath = path.join(__dirname, 'destiny.mp3');
    if (fs.existsSync(audioPath)) {
        await sock.sendMessage(from, { 
            audio: fs.readFileSync(audioPath), 
            mimetype: 'audio/mpeg', 
            ptt: false 
        }, { quoted: m });
    }
  }
};
