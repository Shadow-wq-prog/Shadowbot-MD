module.exports = {
    command: ['ping'],
    run: async (sock, m, from) => {
        await sock.sendMessage(from, { text: '¡PONG! ⚡ Sηαdοωβοτ a toda velocidad.' });
    }
};
