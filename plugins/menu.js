import fs from 'fs'

export default {
    command: ['menu', 'help'],
    run: async (sock, m, args) => {
        const from = m.key.remoteJid
        const isOwnerMenu = args[0]?.toLowerCase() === 'owner'
        
        // --- VALIDACIÓN DE OWNER ---
        let owners = ["51983564381"] // Tu número por defecto
        try {
            if (fs.existsSync('./plugins/Owner/owners.json')) {
                owners = JSON.parse(fs.readFileSync('./plugins/Owner/owners.json', 'utf-8'))
            }
        } catch (e) {}

        const isOwner = owners.some(num => m.sender.includes(num))

        // 1. Si un NO-OWNER pone ".menu owner", el bot miente y dice que no existe
        if (isOwnerMenu && !isOwner) {
            return sock.sendMessage(from, { 
                text: `⚠️ El comando *.menu owner* no existe.\n\n💡 Escribe *.menu* para ver los comandos disponibles.` 
            }, { quoted: m })
        }

        // 2. SI ES EL MENÚ DE OWNER (Solo para ti)
        if (isOwnerMenu && isOwner) {
            const menuOwner = `
┏━━〔 *PANEL DE CONTROL* 〕━━━┓
┃ 🔐 *Acceso:* Shadow Flash
┗━━━━━━━━━━━━━━━━┛

*👑 COMANDOS DE MANTENIMIENTO*
🔹 *.fix / .update* : Sincroniza con GitHub y reinicia.
🔹 *.autofix* : Repara archivos dañados.
🔹 *.backup* : Envía copia de seguridad del bot.
🔹 *.logs* : Mira la consola en tiempo real.
🔹 *.error* : Revisa el historial de fallos.

*👥 GESTIÓN DE PERMISOS*
🔹 *.owner_add* : Añade un nuevo administrador.
🔹 *.main-owner* : Cambia el creador principal.
🔹 *owners.json* : Base de datos de dueños.

_Para volver al menú normal escribe: .menu_`.trim()

            return sock.sendMessage(from, { text: menuOwner }, { quoted: m })
        }

        // 3. MENÚ PÚBLICO (Lo que ven todos los usuarios)
        const menuPublico = `
┏━━〔 *Sηαdοωβοτ* 〕━━━┓
┃ 👤 *Owner:* Shadow Flash
┃ 📟 *Estado:* Online
┗━━━━━━━━━━━━━━┛

*🛡️ MODERACIÓN (Admins)*
🔹 *.kick* : Elimina a un usuario del grupo.
🔹 *.aviso* : Etiqueta a todos (invisible).
🔹 *.tagall* : Etiqueta a todos (lista visible).

*🤖 SISTEMA & IA*
🔹 *.infobot* : Info de RAM y tiempo activo.
🔹 *.ping* : Velocidad de respuesta.
🔹 *.ia* : Habla con la Inteligencia Artificial.

*🎨 MULTIMEDIA*
🔹 *.sticker* : Crea stickers de fotos/videos.
🔹 *.toimg* : Convierte sticker a imagen/video.
🔹 *.play* : Descarga música y videos.

_Shadowbot-MD - Tecnología de Shadow Flash_`.trim()

        await sock.sendMessage(from, { 
            text: menuPublico,
            contextInfo: {
                externalAdReply: {
                    title: 'MENÚ DE COMANDOS',
                    body: 'Selecciona una categoría',
                    sourceUrl: 'https://github.com/',
                    mediaType: 1,
                    showAdAttribution: true,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: m })
    }
}
