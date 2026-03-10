module.exports = {
    command: ['menu', 'help'],
    run: async (sock, m, from) => {
        const text = `
┏━━━━ ✨ *MENÚ* ✨ ━━━━┓
┃
┣━━━ 🤖 *BOT INFO*
┃ ◈ .ping
┃ ◈ .owner
┃ ◈ .runtime
┃
┣━━━ 🎨 *MULTIPERFIL*
┃ ◈ .s (Sticker)
┃
┗━━━━━━━━━━━━━━━━┛`.trim();
        await sock.sendMessage(from, { text });
    }
};
