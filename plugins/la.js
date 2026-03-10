import fetch from 'node-fetch';

export default {
  command: ['ia', 'chatgpt'],
  category: 'ai',
  run: async (client, m, args, command) => {

    const text = args.join(' ');

    if (!text) {
      return client.sendMessage(m.chat, { text: `ꕥ Hola, soy *Sηαdοωβοτ*. Escribe una petición para ayudarte.\n\n*Ejemplo:* .ia quien es tu creador?` }, { quoted: m });
    }

    // Aquí inyectamos tu identidad para que la IA no se equivoque
    const identidad = `Tu nombre es Sηαdοωβοτ. Tu creador es Shadow Flash. Responde de forma épica y amable. `;
    const fullPrompt = identidad + text;

    // Usaremos una API que permite prompts largos
    const apiUrl = `https://api.siputzx.my.id/api/ai/gpt3?prompt=${encodeURIComponent(fullPrompt)}`;

    try {
      const txc = `✎ *Sηαdοωβοτ* está procesando tu respuesta...`;
      const { key } = await client.sendMessage(
        m.chat,
        { text: txc },
        { quoted: m },
      );

      const res = await fetch(apiUrl);
      const json = await res.json();

      if (!json || !json.data) {
        return client.sendMessage(m.chat, { text: 'ꕥ Lo siento, mi conexión cerebral falló.', edit: key });
      }

      // Limpiamos la respuesta de cualquier mención a OpenAI o ChatGPT
      let response = json.data
        .replace(/ChatGPT/g, 'Sηαdοωβοτ')
        .replace(/OpenAI/g, 'Shadow Flash')
        .trim();

      const finalMsg = `*亗 Sηαdοωβοτ IA*\n\n${response}\n\n> 👤 *By: Shadow Flash*`;
      
      await client.sendMessage(m.chat, { text: finalMsg, edit: key });
      
    } catch (error) {
      console.error(error);
      await client.sendMessage(m.chat, { text: '❌ Ocurrió un error inesperado.' }, { quoted: m });
    }
  },
};
