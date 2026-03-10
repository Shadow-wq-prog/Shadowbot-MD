module.exports = {
    command: ['owner', 'creador'],
    run: async (sock, m, from) => {
        await sock.sendMessage(from, { text: '😎 *Dueño:* Fernando\n*GitHub:* Shadow-wq-prog' });
    }
};
