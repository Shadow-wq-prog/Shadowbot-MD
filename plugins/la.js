const axios = require('axios');

module.exports = {
  command: ['ia', 'chatgpt', 'bot'],
  run: async (sock, m, from, args) => {
    const text = args.join(' ');
    if (!text) return sock.sendMessage(from, { text: '¿En qué puedo ayudarte hoy? 👤\n*Ejemplo:* .ia como cocinar arroz' }, { quoted: m });

    try {
      await sock.sendMessage(from, { react: { text: '🧠', key: m.key } });
      const { data } = await axios.get(`https://api.siputzx.my.id/api/ai/gpt3?prompt=${encodeURIComponent(text)}`);
      
      let respuesta = `*亗 Sηαdοωβοτ IA*\n\n${data.data}\n\n> 👤 *By: Shadow Flash*`;
      await sock.sendMessage(from, { text: respuesta }, { quoted: m });
    } catch (e) {
      sock.sendMessage(from, { text: '❌ Lo siento, mi conexión cerebral falló.' }, { quoted: m });
    }
  }
};
