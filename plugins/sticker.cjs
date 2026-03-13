import { smsg } from '../lib/message.js'
import exif from '../lib/exif.js'

let handler = async (m, { client, command }) => {
let q = m.quoted ? m.quoted : m
let mime = (q.msg || q).mimetype || ''

if (/image|video|webp/.test(mime)) {
    let img = await q.download()
    if (!img) return m.reply('❌ Error al descargar el medio.')
    
    m.reply('⏳ Procesando sticker...')
    
    let sticker = await exif.writeExif({ data: img, mimetype: mime }, { 
        packname: 'Sηαdοωβοτ', 
        author: 'Shadow Flash' 
    })
    
    await client.sendMessage(m.chat, { sticker: { url: sticker } }, { quoted: m })
} else {
    m.reply(`✨ Responde a una imagen o video con *${m.prefix + command}*`)
}
}

handler.command = ['s', 'sticker']
export default handler
