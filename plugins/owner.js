/*
Sηαdοωβοτ - Owner Plugin
*/

let handler = async (m, { conn }) => {
    // Aquí va tu código para mostrar el número del dueño
    const ownerNumber = '51983564381@s.whatsapp.net'
    await conn.reply(m.chat, `¡Hola! El dueño de Sηαdοωβοτ es: wa.me/51983564381`, m)
}

handler.command = ['owner', 'dueño']
export default handler // <--- ESTO ES LO IMPORTANTE
