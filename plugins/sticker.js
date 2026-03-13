/*
Creador: Shadow Flash
Bot: Sηαdοωβοτ
*/

import { sticker } from '../lib/sticker.js' // Asegúrate de que esta ruta sea correcta en tu bot

export default {
    command: ['s', 'sticker', 'stiker'],
    run: async (client, m, { args }) => {
        const from = m.key.remoteJid
        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || ''

        if (/image|video|webp/.test(mime)) {
            await client.sendMessage(from, { react: { text: '✨', key: m.key } })
            let img = await q.download()
            if (!img) return m.reply('❌ Error al descargar el archivo.')

            let stiker = await sticker(img, false, 'Sηαdοωβοτ', 'Shadow Flash')
            if (stiker) {
                await client.sendMessage(from, { sticker: stiker }, { quoted: m })
            }
        } else {
            m.reply('📝 *Sηαdοωβοτ:* Responde a una imagen, GIF o video corto con el comando */s*')
        }
    }
}
