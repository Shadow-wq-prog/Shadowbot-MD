import fs from 'fs';

export default {
    command: ['toimg', 'tovideo', 'img'],
    category: 'utils',
    run: async (client, m) => {
        try {
            const quoted = m.quoted ? m.quoted : m;
            const mime = (quoted.msg || quoted).mimetype || '';
            
            // --- METADATOS Y LENGUAJE DE TU BASE ¥S ---
            let user = globalThis.db.data.users[m.sender];
            const name = user.name || m.pushName;
            let text1 = user.metadatos2 || `${name}`;
            let text2 = user.metadatos || `\n❀s᥆⍴һіᥲ ᥕᥲ ᑲ᥆𝗍 - ⍴᥆ᥕᥱrᥱძ s⍴ᥲᥴᥱᥒіgһ𝗍 𝗍ᥱᥲm❀`;

            // --- ESCENARIO 1: SOLO EL COMANDO (MANTENIENDO LENGUAJE ¥S) ---
            if (!m.quoted || !/webp/.test(mime)) {
                const explicacion = `
✐ *${name}*, para usar este comando:
1. Responde a un *Sticker Estático* (Imagen).
2. Responde a un *Sticker Animado* (Video).

💡 *Ejemplo:* Responde al sticker y escribe *.toimg*
${text2}`.trim();
                return m.reply(explicacion);
            }

            m.reply('⏳ *Revirtiendo sticker, espera...*');

            // --- PROCESAMIENTO SIN DEPENDENCIAS ---
            let media = await quoted.download();
            const isAnimated = (quoted.msg || quoted).isAnimated || false;

            if (isAnimated) {
                // --- CONVERSIÓN A VIDEO ---
                await client.sendMessage(m.chat, { 
                    video: media, 
                    caption: `✅ *Conversión Exitosa (Video)*\n${text2}`,
                    mimetype: 'video/mp4'
                }, { quoted: m });
            } else {
                // --- CONVERSIÓN A IMAGEN ---
                await client.sendMessage(m.chat, { 
                    image: media, 
                    caption: `✅ *Conversión Exitosa (Imagen)*\n${text2}` 
                }, { quoted: m });
            }

        } catch (e) {
            console.error(e);
            // Mantiene el estilo de error de tu base
            m.reply('❌ *Error en la Matrix:* ' + e);
        }
    }
};