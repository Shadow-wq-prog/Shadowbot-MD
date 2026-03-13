/*
Creador: Shadow Flash
Bot: Sηαdοωβοτ
*/

export default {
  command: ['prefix', 'setprefix', 'prefijo'],
  category: 'settings',
  run: async (client, m, { args }) => {
    // Definimos tu número como Owner principal
    const ownerNumber = '51983564381@s.whatsapp.net'
    const ownerBotId = client.user.id.split(':')[0] + '@s.whatsapp.net'

    // Aseguramos que la base de datos global exista
    global.db = global.db || { data: { settings: {} } }
    global.db.data.settings = global.db.data.settings || {}

    // Verificación de permisos: Solo tú (Shadow) puedes cambiar esto
    const isOwner = m.sender === ownerNumber || m.fromMe
    if (!isOwner) return m.reply('✘ Solo mi creador Shadow Flash puede usar este comando.')

    const value = args.join(' ').trim()
    
    // Si no envías nada, muestra los ejemplos
    if (!value) {
      return m.reply('✎ Envía el nuevo prefijo para **Sηαdοωβοτ**.\n\n*Ejemplo:* `.prefix #` o `.prefix /!`\n\n> Sugeridos: `.` `/` `#` `!` `?` `$`')
    }

    // Validación de caracteres permitidos
    const allowedChars = /^[\/\.~?,#!^%&<+\-×÷=:;°)\]}¡¿€£¥$¤₽●□■☆♤♡◇♧π√¢]+$/
    if (!allowedChars.test(value)) {
      return m.reply('《✧》 Elija un prefijo válido que no contenga letras ni números.')
    }

    // Guardamos los prefijos en la configuración del bot
    global.db.data.settings[ownerBotId] = global.db.data.settings[ownerBotId] || {}
    const config = global.db.data.settings[ownerBotId]
    
    // Convertimos el string en un array de caracteres
    const prefijos = [...value]
    config.prefijo = prefijos

    // Intentamos guardar en la base de datos física si tu index.js lo soporta
    if (global.db.write) await global.db.write()

    return m.reply(`✿ Los prefijos de **Sηαdοωβοτ** han sido actualizados a: *${value}*\n\n> Ahora puedes usar comandos con cualquiera de ellos.`)
  },
};
