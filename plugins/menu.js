import fs from 'fs'

export default {
    command: ['menu', 'help'],
    run: async (sock, m, args) => {
        const from = m.key.remoteJid
        const isOwnerMenu = args[0]?.toLowerCase() === 'owner'
        
        // --- DETECCIÓN DE OWNER ---
        let owners = ["51983564381"] // Cambia por tu número
        try {
            if (fs.existsSync('./plugins/Owner/owners.json')) {
                owners = JSON.parse(fs.readFileSync('./plugins/Owner/owners.json', 'utf-8'))
            }
        } catch (e) {}
        const isOwner = owners.some(num => m.sender.includes(num))

        // 1. BLOQUEO PARA NO-OWNERS
        if (isOwnerMenu && !isOwner) {
            return sock.sendMessage(from, { 
                text: `⚠️ El comando *.menu owner* no existe.\n\n💡 Escribe *.menu* para ver la lista pública.` 
            }, { quoted: m })
        }

        // 2. MENÚ PARA EL DUEÑO (Panel Secreto)
        if (isOwnerMenu && isOwner) {
            const menuOwner = `
╭━━〔 🛠️ *OWNER PANEL* 〕━━╮
┃
┃ 📂 *MANTENIMIENTO*
┃ 🔹 .fix / .update
┃ 🔹 .rfix / .autofix
┃ 🔹 .backup / .logs
┃
┃ 👥 *CONFIGURACIÓN*
┃ 🔹 .owner_add
┃ 🔹 .main-owner
┃ 🔹 .owners.json
┃
┃ ⚠️ *SISTEMA*
┃ 🔹 .error / .ia
┃
╰━━━━━━━━━━━━━━━╯`.trim()
            return sock.sendMessage(from, { text: menuOwner }, { quoted: m })
        }

        // 3. MENÚ PÚBLICO (Categorías completas)
        const menuPublico = `
╭━━〔 ✨ *Sηαdοωβοτ* ✨ 〕━━╮
┃ 👤 *User:* Shadow Flash
┃ 📟 *Plugins:* 25 cargados
┃ ⚡ *Prefix:* [ . ]
┣━━━━━━━━━━━━━━━┛
┃
┃ 🤖 *BOT INFO*
┃ 🔹 .ping / .p
┃ 🔹 .infobot / .status
┃ 🔹 .runtime
┃
┃ 🛡️ *MODERACIÓN*
┃ 🔹 .kick / .sacar
┃ 🔹 .aviso / .hidetag
┃ 🔹 .tagall / .invocar
┃
┃ 🎨 *MULTIMEDIA*
┃ 🔹 .s (Sticker)
┃ 🔹 .toimg (Sticker a Foto)
┃ 🔹 .tovideo (Sticker a Video)
┃ 🔹 .play (Música/YouTube)
┃
┃ 💡 *AYUDA*
┃ 🔹 .menu owner (Solo Dueño)
┃
╰━━━━━━━━━━━━━━━╯`.trim()

        await sock.sendMessage(from, { 
            text: menuPublico,
            contextInfo: {
                externalAdReply: {
                    title: 'Sηαdοωβοτ OFICIAL',
                    body: 'Panel de Comandos v2.0',
                    mediaType: 1,
                    showAdAttribution: true,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: m })
    }
}
