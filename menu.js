module.exports = {
    command: ['menu', 'help'],
    run: async (sock, m, from) => {
        const text = `✨ *Sηαdοωβοτ - MENÚ* ✨\n\n◈ .ping\n◈ .owner\n◈ .menu`;
        await sock.sendMessage(from, { text });
    }
};
