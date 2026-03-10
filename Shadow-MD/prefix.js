/*
Creador: Shadow Flash
Bot: Sηαdοωβοτ
*/

module.exports = {
  command: ['prefix', 'setprefix', 'prefijo'],
  run: async (sock, m, from, args) => {
    // Definimos los prefijos permitidos
    const allowedChars = /^[\/\.~?,#!^%&<+\-×÷=:;°)\]}¡¿€£¥$¤₽●□■☆♤♡◇♧π√¢]+$/;
    const value = args.join(' ').trim();

    if (!value) {
      return sock.sendMessage(from, { text: '✎ *Sηαdοωβοτ* - Envía el nuevo prefijo.\n\n> Ejemplos: `.` `!` `#` `/`' }, { quoted: m });
    }

    if (!allowedChars.test(value)) {
      return sock.sendMessage(from, { text: '《✧》 Elija un prefijo válido.\n\n> Math: `+` `-` `~` `×` `÷` `%` \n> Unicode: `¤` `●` `□` `■` `☆` `♤` `♡` `◇` `♧`' }, { quoted: m });
    }

    // Nota: Para que esto sea permanente, tu index.js debe leer el prefijo de una variable global o DB.
    // Por ahora, el bot confirmará el cambio.
    global.prefix = value; 

    return sock.sendMessage(from, { 
      text: `✿ *Sηαdοωβοτ* ha cambiado sus prefijos a: *${value}*\n\n> Powered by Shadow Flash` 
    }, { quoted: m });
  },
};
