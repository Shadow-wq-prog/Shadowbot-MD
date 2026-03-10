const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { exec } = require('child_process');
const fs = require('fs');

module.exports = {
    command: ['s', 'sticker'],
    run: async (sock, m, from) => {
        const quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage;
        const msg = m.message.imageMessage || quoted?.imageMessage || m.message.videoMessage || quoted?.videoMessage;

        if (!msg) return sock.sendMessage(from, { text: '❌ ¡Responde a una imagen o video con *.s*!' });

        await sock.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const stream = await downloadContentFromMessage(msg, msg.url ? 'image' : 'video');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        const tempFile = `./plugins/temp_${Date.now()}.webp`;
        const inputFile = `./plugins/temp_${Date.now()}.png`;
        fs.writeFileSync(inputFile, buffer);

        exec(`ffmpeg -i ${inputFile} -vcodec libwebp -filter:v fps=fps=20 -lossless 1 -loop 0 -preset default -an -vsync 0 -s 512:512 ${tempFile}`, (err) => {
            if (err) return sock.sendMessage(from, { text: '❌ Error al procesar. Instala ffmpeg en Termux.' });
            
            sock.sendMessage(from, { sticker: fs.readFileSync(tempFile) });
            fs.unlinkSync(inputFile);
            fs.unlinkSync(tempFile);
        });
    }
};
