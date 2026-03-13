import { sticker } from 'sticker-maded' // Usaremos una librería directa

export default {
    command: ['s', 'sticker'],
    run: async (client, m, { args }) => {
        const from = m.key.remoteJid
        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || ''

        if (/image|video|webp/.test(mime)) {
            await client.sendMessage(from, { react: { text: '⏳', key: m.key } })
            let img = await q.download()
            
            // Enviamos el sticker directamente
            await client.sendMessage(from, { 
                sticker: img, 
                packname: 'Sηαdοωβοτ', 
                author: 'Shadow Flash' 
            }, { quoted: m })
            
            await client.sendMessage(from, { react: { text: '✅', key: m.key } })
        } else {
            client.sendMessage(from, { text: '⚠️ Responde a una imagen o video corto.' }, { quoted: m })
        }
    }
}
