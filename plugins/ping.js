/*
Creador: Shadow Flash
Bot: Sηαdοωβοτ
*/

const os = require('os');
const fs = require('fs');
const path = require('path');

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
  run: async (sock, m, from) => {
    const start = Date.now();
    const userTag = m.pushName || 'Usuario';

    const { key } = await sock.sendMessage(from, { 
      text: `⌗°亗˚₊\n\`Usuario:\` *${userTag}*\n────────────────\n❀ *Sηαdοωβοτ cargando ping…*\n────────────────\n> Powered by Shadow Flash ⚡` 
    }, { quoted: m });

    const latency = Date.now() - start;
    const up = process.uptime();
    const h = Math.floor(up / 3600);
    const min = Math.floor((up % 3600) / 60);
    const s = Math.floor(up % 60);
    
    const ram = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const usedRom = (getFolderSize(process.cwd()) / 1024 / 1024).toFixed(2);

    let msg = `⌗°亗°₊\n\`Usuario:\` *${userTag}*\n`;
    msg += `────────────────\n`;
    msg += `❀ \`Ping:\` ${latency} ms\n`;
    msg += `ⴵ \`Sηαdοωβοτ Uptime:\` [ ${h}h ${min}m ${s}s ]\n`;
    msg += `✥ \`RAM:\` ${ram} MB\n`;
    msg += `ꕥ \`ROM:\` ${usedRom} MB\n`;
    msg += `────────────────\n`;
    msg += `> Sηαdοωβοτ ⚡ by Shadow Flash`;

    await sock.sendMessage(from, { text: msg.trim(), edit: key });
  }
};
