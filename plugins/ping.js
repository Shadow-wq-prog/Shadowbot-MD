https://chat.whatsapp.com/IyxuHbUdgvYBcVit6sThOO
*/


import moment from "moment";
import os from "os";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

export default {
  command: ["ping", "p"],
  category: "info",
  run: async (client, m, args) => {
    const start = Date.now();
    const senderNumber = m.sender.split('@')[0];

    const isOwner = (global.owner || []).some(user => 
      (Array.isArray(user) ? user[0] : user).replace(/[^0-9]/g, '') === senderNumber.replace(/[^0-9]/g, '')
    );
    const isModeration = (global.mods || []).includes(senderNumber);
    const isMaintenance = (global.maintenanceUsers || []).includes(senderNumber);

    const version = global.version || "No definida"; 
    const internalVersion = global.internalVersion || "No definida";
    const userTag = m.pushName || senderNumber || "Usuario";

    const { key } = await client.sendMessage(
      m.chat,
      { text: `⌗°亗˚₊\n\`Usuario:\` *${userTag}*\n────────────────\n❀ *Cargando ping…*\n────────────────\n> ❀Mαʂԋα ɯα Ⴆσƚ❀ powered 亗𝙽𝚎𝚝𝚑𝚎𝚛𝙻𝚘𝚛𝚍亗` },
      { quoted: m }
    );

    const latency = Date.now() - start;
    let msg = `⌗°亗°₊\n\`Usuario:\` *${userTag}*\n`;
    msg += `────────────────\n❀ \`Ping:\` ${latency} ms\n────────────────\n`;

    if (isOwner || isModeration || isMaintenance) {
      const up = process.uptime();
      const h = Math.floor(up / 3600);
      const min = Math.floor((up % 3600) / 60);
      const s = Math.floor(up % 60);
      const uptimeStr = `[ ${h}h ${min}m ${s}s ]`;
      const ram = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
      const usedRom = (getFolderSize(process.cwd()) / 1024 / 1024).toFixed(2);

      if (isOwner) {
        msg += `*ⴵ* \`Uptime:\` ${uptimeStr}\n✥ \`RAM usada:\` ${ram} MB\nꕥ \`ROM usada:\` ${usedRom} MB\n────────────────\n> Interfaz *_Owner_*\n> ✎ *Versión Interna: ${internalVersion}*\n`;
      } else if (isModeration) {
        msg += `*ⴵ* \`Uptime:\` ${uptimeStr}\n✥ \`RAM usada:\` ${ram} MB\nꕥ \`ROM usada:\` ${usedRom} MB\n────────────────\n> Interfaz *_Moderador_*\n`;
      } else if (isMaintenance) {
        msg += `*ⴵ* \`Uptime:\` ${uptimeStr}\n────────────────\n> Interfaz *_Tester_*\n> ✎ *Versión Interna: ${internalVersion}*\n`;
      }
    }

    msg += `> ✎ *Versión: ${version}*\n> ❀Mαʂԋα ɯα Ⴆσƚ❀ powered 亗𝙽𝚎𝚝𝚑𝚎𝚛𝙻𝚘𝚛𝚍亗`;

    await client.sendMessage(m.chat, { text: msg.trim(), edit: key, mentions: [m.sender] });

    const audioPath = path.join(__dirname, 'destiny.mp3');
    if (fs.existsSync(audioPath)) {
        try {
            const audioBuffer = fs.readFileSync(audioPath); 
            
            await client.sendMessage(m.chat, { 
                audio: audioBuffer, 
                mimetype: 'audio/mpeg', 
                ptt: false 
            }, { quoted: m });
        } catch (error) {
            console.error('Error al enviar el audio:', error);
        }
    }
  },
};
