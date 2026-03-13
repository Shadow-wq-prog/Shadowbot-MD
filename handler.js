
/*
Creador: Shadow Flash
Bot: Sηαdοωβοτ
*/

import moment from 'moment-timezone';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import initDB from './lib/system/initDB.js';
import { smsg } from './lib/message.js';

export default async (client, m, chatUpdate) => {
  if (!m) return;
  if (m.isBaileys) return; // Ignorar mensajes del propio bot

  const selfId = client.user.id.split(':')[0] + '@s.whatsapp.net';
  const ownerNumber = '51983564381@s.whatsapp.net';

  try {
    // 1. Inicializar Base de Datos
    try {
      initDB(m, client);
    } catch (e) {
      console.error(chalk.red(`[ ERROR DB ] →`), e);
    }

    // 2. Configuración de Prefijos y Nombre
    const settings = global.db.data.settings[selfId] || {};
    const botName = settings.namebot2 || 'Sηαdοωβοτ';
    const prefas = settings.prefijo || ['.', '/', '#', '!'];
    
    // Detectar si el mensaje usa un prefijo válido
    const isPrefix = prefas.find(p => m.body.startsWith(p));
    const prefix = isPrefix ? isPrefix : null;

    // 3. Log de Consola (Tu estilo personalizado)
    if (m.message && prefix) {
      console.log(chalk.cyan('𝄢 · • —– ٠ ✤ ٠ —– • · · • —– ٠ ✤ ٠ —– • ·✧༄'));
      console.log(`${chalk.green('𝐔𝐒𝐔𝐀𝐑𝐈𝐎 ❱❱')} ${chalk.white(m.pushName || 'User')}`);
      console.log(`${chalk.green('𝐂𝐎𝐌𝐀𝐍𝐃𝐎 ❱❱')} ${chalk.yellow(m.body)}`);
      console.log(`${chalk.green('𝐆𝐑𝐔𝐏𝐎 ❱❱')} ${chalk.white(m.isGroup ? m.chat : 'Chat Privado')}`);
      console.log(chalk.cyan('𝄢 · • —– ٠ ✤ ٠ —– • · · • —– ٠ ✤ ٠ —– • ·✧༄'));
    }

    if (!prefix) return;

    // 4. Variables de Comando
    const args = m.body.slice(prefix.length).trim().split(/ +/);
    const command = args.shift()?.toLowerCase();
    const text = args.join(' ');
    const isOwner = m.sender === ownerNumber || m.fromMe;

    // 5. Ejecución de Plugins (Comandos Importantes)
    const plugin = global.plugins[command] || Object.values(global.plugins).find(p => p.command && p.command.includes(command));

    if (plugin) {
      // Validaciones de seguridad
      if (plugin.isOwner && !isOwner) {
        return m.reply('❌ Este comando es exclusivo de Shadow Flash.');
      }

      // Ejecutar el comando
      try {
        await plugin.run(client, m, { args, text, prefix, command });
      } catch (err) {
        console.error(chalk.red(`[ PLUGIN ERROR ] → ${command}`), err);
        m.reply('🌱 Hubo un error interno al ejecutar este comando.');
      }
    }

  } catch (e) {
    console.error(chalk.red(`[ MASTER HANDLER ERROR ]`), e);
  }
};
