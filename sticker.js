const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = {
    command: ['s', 'sticker'],
    run: async (sock, m, from) => {
        const type = Object.keys(m.message)[0];
        const quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage;
        
        // Revisar si el mensaje es una imagen o si están citando una imagen
        const msg = m.message.imageMessage || quoted?.imageMessage || m.message.videoMessage || quoted?.videoMessage;

        if (!msg) return sock.sendMessage(from, { text: '❌ ¡Responde a una imagen o video con *.s*!' });

        const stream = await downloadContentFromMessage(msg, msg.url ? 'image' : 'video');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        const fileName = path.join(__dirname, `temp_${Date.now()}.webp`);
        const inputName = path.join(__dirname, `temp_${Date.now()}.png`);
        
        fs.writeFileSync(inputName, buffer);

        // Usamos ffmpeg para convertir a webp (asegúrate de tenerlo instalado en Termux)
        exec(`ffmpeg -i ${inputName} -vcodec libwebp -filter:v fps=fps=20 -lossless 1 -loop 0 -preset default -an -vsync 0 -s 512:512 ${fileName}`, (err) => {
            if (err) return sock.sendMessage(from, { text: '❌ Error al crear sticker. Asegúrate de tener ffmpeg.' });
            
            sock.sendMessage(from, { sticker: fs.readFileSync(fileName) });
            
            // Borrar archivos temporales
            fs.unlinkSync(inputName);
            fs.unlinkSync(fileName);
        });
    }
};
