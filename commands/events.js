
/*
Creador: Shadow Flash
Bot: Sηαdοωβοτ
*/

import chalk from 'chalk'
import moment from 'moment-timezone'

export default async (client, m) => {
    // Evitar duplicar los escuchadores de eventos
    if (!client._groupParticipantsRegistered) {
        try { client.ev.setMaxListeners(1000) } catch {}
        
        client.ev.on('group-participants.update', async (anu) => {
            try {
                const metadata = await client.groupMetadata(anu.id)
                const chat = global.db.data.chats[anu.id] || {}
                const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
                const primaryBotId = chat?.primaryBot
                const dev = 'Shadow Flash'
                
                // Configuración desde la base de datos
                const botSettings = global.db.data.settings[botId] || {}
                const botName = botSettings.namebot || 'Sηαdοωβοτ'
                const channelId = botSettings.id || '120363198641161536@newsletter'

                const memberCount = metadata.participants.length

                for (const p of anu.participants) {
                    const jid = p.id || p.jid || p 
                    const phone = jid.split('@')[0]
                    const pp = await client.profilePictureUrl(jid, 'image').catch(_ => 'https://cdn.stellarwa.xyz/files/1755559736781.jpeg')

                    // Estética del Bot (Contexto falso para simular reenvío de canal)
                    const fakeContext = {
                        contextInfo: {
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: channelId,
                                serverMessageId: '0',
                                newsletterName: botSettings.nameid || 'Sηαdοωβοτ Updates'
                            },
                            externalAdReply: {
                                title: botName,
                                body: `By ${dev}`,
                                thumbnailUrl: botSettings.icon || pp,
                                sourceUrl: botSettings.link || '',
                                mediaType: 1,
                                showAdAttribution: true,
                                renderLargerThumbnail: false
                            },
                            mentionedJid: [jid]
                        }
                    }

                    // --- Lógica de Bienvenida ---
                    if (anu.action === 'add' && chat?.welcome && (!primaryBotId || primaryBotId === botId)) {
                        const caption = `╭┈──̇─̇─̇────̇─̇─̇──◯◝\n┊「 *BIENVENIDO (⁠ ⁠ꈍ⁠ᴗ⁠ꈍ⁠)* 」\n┊︶︶︶︶︶︶︶︶︶︶︶\n┊  *Usuario ›* @${phone}\n┊  *Grupo ›* ${metadata.subject}\n┊┈─────̇─̇─̇─────◯◝\n┊➤ *Usa /menu para ver mis comandos.*\n┊➤ *Ahora somos ${memberCount} miembros.*\n┊ ︿︿︿︿︿︿︿︿︿︿︿\n╰─────────────────╯`
                        await client.sendMessage(anu.id, { image: { url: pp }, caption, mentions: [jid], ...fakeContext })
                    }

                    // --- Lógica de Despedida ---
                    if ((anu.action === 'remove' || anu.action === 'leave') && chat?.welcome && (!primaryBotId || primaryBotId === botId)) {
                        const caption = `╭┈──̇─̇─̇────̇─̇─̇──◯◝\n┊「 *@${phone} SE HA IDO* 」\n┊         *(⁠╥⁠﹏⁠╥⁠)*\n┊︶︶︶︶︶︶︶︶︶︶︶\n┊➤ *Un miembro menos en el equipo.*\n┊➤ *Esperamos que te vaya bien.*\n┊➤ *Quedamos ${memberCount} miembros.*\n┊ ︿︿︿︿︿︿︿︿︿︿︿\n╰─────────────────╯`
                        await client.sendMessage(anu.id, { image: { url: pp }, caption, mentions: [jid], ...fakeContext })
                    }

                    // --- Alertas de Admin ---
                    if (anu.action === 'promote' && (!primaryBotId || primaryBotId === botId)) {
                        const usuario = anu.author || 'Sistema'
                        await client.sendMessage(anu.id, {
                            text: `「✎」 *@${phone}* ahora es Administrador de este grupo.\nAcción realizada por: *@${usuario.split('@')[0]}*`,
                            mentions: [jid, usuario]
                        })
                    }

                    if (anu.action === 'demote' && (!primaryBotId || primaryBotId === botId)) {
                        const usuario =
