import chalk from 'chalk';
import moment from 'moment-timezone';
import { smsg } from './lib/message.js';

export default async function handler(client, m, chatUpdate) {
  if (!m) return;
  try {
    const selfId = client.user.id.split(':')[0] + '@s.whatsapp.net';
    const ownerNumber = '51983564381@s.whatsapp.net';
    const isOwner = m.sender === ownerNumber || m.fromMe;

    // Log de consola con tu estilo
    if (m.message) {
      console.log(chalk.cyan('𝄢 · • —– ٠ ✤ ٠ —– • · · • —– ٠ ✤ ٠ —– • ·✧༄'));
      console.log(`${chalk.green('𝐔𝐒𝐔𝐀𝐑𝐈𝐎 ❱❱')} ${chalk.white(m.pushName || 'User')}`);
      console.log(`${chalk.green('𝐌𝐄𝐍𝐒𝐀𝐉𝐄 ❱❱')} ${chalk.white(m.body || m.type)}`);
      console.log(chalk.cyan('𝄢 · • —– ٠ ✤ ٠ —– • · · • —– ٠ ✤ ٠ —– • ·✧༄'));
    }

    // Respuesta básica de prueba
    if (m.body === 'ping') {
      return m.reply('pon');
    }

  } catch (e) {
    console.error(chalk.red('[ ERROR EN HANDLER ]'), e);
  }
}