import fetch from 'node-fetch';

export default {
  command: ['ia', 'chatgpt'],
  category: 'ai',
  run: async (client, m, args) => {
    const text = args.join(' ');

    if (!text) {
      return client.sendMessage(m.chat, { text: `ꕥ Hola, soy *Sηαdοωβοτ*. ¿En qué puedo ayudarte hoy?\n\n*Ejemplo:* .ia ¿quién es Shadow Flash?` }, { quoted: m });
    }

    try {
      // Mensaje de espera con tu marca
      const { key } = await client.sendMessage(m.chat, { text: `✎ *Sηαdοωβοτ* está procesando tu respuesta...` }, { quoted: m });

      // Inyectamos la identidad directamente en la consulta
      const prompt = `Tu nombre es Sηαdοωβοτ. Tu creador es Shadow Flash. No menciones a OpenAI ni a ChatGPT. Responde a esto: ${text}`;
      const res = await fetch(`https://api.siputzx.my.id/api/ai/gpt3?prompt=${encodeURIComponent(prompt)}`);
      const json = await res.json();

      if (!json.data) throw new Error('Sin respuesta');

      // Limpieza de nombres por si la IA se olvida
      let response = json.data
        .replace(/ChatGPT/g, 'Sηαdοωβοτ')
        .replace(/OpenAI/g, 'Shadow Flash')
        .replace(/IA de Google/g, 'Sηαdοωβοτ');

      const finalMsg = `*亗 Sηαdοωβοτ IA*\n\n${response}\n\n> 👤 *By: Shadow Flash*`;
      
      await client.sendMessage(m.chat, { text: finalMsg, edit: key });

    } catch (error) {
      console.error(error);
      await client.sendMessage(m.chat, { text: `❌ *Sηαdοωβοτ:* Mi conexión cerebral falló. Intenta de nuevo.` }, { quoted: m });
    }
  },
};
