import fs from 'fs';

export default {
    command: ['sticker', 's'],
    category: 'utils',
    isOwner: false, // <--- Esto permite que TODOS lo usen
    run: async (client, m) => {
        try {
            let media;
            const quoted = m.quoted ? m.quoted : m;
            const mime = (quoted.msg || quoted).mimetype || '';
            const from = m.key.remoteJid;

            // --- TU IDENTIDAD DEFINITIVA ---
            const packname = "Sηαdοωβοτ";
            const author = "Shadow Flash";

            if (/image/.test(mime)) {
                media = await quoted.download();
                // Usamos el remoteJid para que Baileys no de error
                let encmedia = await client.sendImageAsSticker(from, media, m, { 
                    packname: packname, 
                    author: author 
                });
                
                if (fs.existsSync(encmedia)) await fs.unlinkSync(encmedia);
                
            } else if (/video/.test(mime)) {
                if ((quoted.msg || quoted).seconds > 10) {
                    return client.sendMessage(from, { text: '⚠️ El video es muy largo. Máximo 10 segundos.' }, { quoted: m });
                }
                
                media = await quoted.download();
                let encmedia = await client.sendVideoAsSticker(from, media, m, { 
                    packname: packname, 
                    author: author 
                });
                
                // Pequeña espera para que Termux termine de procesar el video
                await new Promise((resolve) => setTimeout(resolve, 2000));
                if (fs.existsSync(encmedia)) await fs.unlinkSync(encmedia);
                
            } else {
                return client.sendMessage(from, { text: '✐ Responde a una imagen o video con *.s* para hacerlo sticker.' }, { quoted: m });
            }
        } catch (e) {
            console.error(e);
            const from = m.key.remoteJid;
            // Solo avisar del error si es necesario
            if (e.message !== "Cannot read properties of undefined (reading 'remoteJid')") {
                await client.sendMessage(from, { text: `❌ Hubo un fallo al crear el sticker.` }, { quoted: m });
            }
        }
    }
};
