import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { getRandom } from '../lib/functions.js'; // Asegúrate de tener esta función o usa una alternativa

export default {
    command: ['toimg', 'tovideo', 'convertir'],
    category: 'multimedia',
    run: async (sock, m, args) => {
        const from = m.key.remoteJid;
        const quoted = m.quoted ? m.quoted : m;
        const mime = (quoted.msg || quoted).mimetype || '';

        // Verificamos si es un sticker
        if (!/webp/.test(mime)) {
            return sock.sendMessage(from, { text: '⚠️ Por favor, responde a un sticker para convertirlo.' }, { quoted: m });
        }

        await sock.sendMessage(from, { text: '⏳ Convirtiendo, espera un momento...' }, { quoted: m });

        try {
            // Descargamos el sticker
            const media = await quoted.download();
            const isAnimated = quoted.msg.isAnimated; // Detecta si el sticker es animado

            // Nombres de archivo temporales
            const filename = getRandom('.webp');
            const outputFilename = isAnimated ? getRandom('.mp4') : getRandom('.jpg');
            const tmpDir = path.join(process.cwd(), 'tmp');

            // Creamos carpeta temporal si no existe
            if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

            const inputPath = path.join(tmpDir, filename);
            const outputPath = path.join(tmpDir, outputFilename);

            // Guardamos el webp descargado
            fs.writeFileSync(inputPath, media);

            if (isAnimated) {
                // Conversión de Sticker ANIMADO a VIDEO (MP4) usando FFmpeg
                // Asegúrate de tener ffmpeg instalado en Termux: pkg install ffmpeg
                exec(`ffmpeg -i ${inputPath} -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ${outputPath}`, async (err) => {
                    if (err) throw err;
                    
                    await sock.sendMessage(from, { 
                        video: fs.readFileSync(outputPath), 
                        caption: '✅ Sticker animado convertido a video.' 
                    }, { quoted: m });
                    
                    // Limpieza
                    fs.unlinkSync(inputPath);
                    fs.unlinkSync(outputPath);
                });
            } else {
                // Conversión de Sticker FIJO a IMAGEN (JPG)
                exec(`ffmpeg -i ${inputPath} ${outputPath}`, async (err) => {
                    if (err) throw err;

                    await sock.sendMessage(from, { 
                        image: fs.readFileSync(outputPath), 
                        caption: '✅ Sticker convertido a imagen.' 
                    }, { quoted: m });
                    
                    // Limpieza
                    fs.unlinkSync(inputPath);
                    fs.unlinkSync(outputPath);
                });
            }

        } catch (e) {
            console.error(e);
            await sock.sendMessage(from, { text: `❌ Hubo un error en la conversión: ${e.message}` }, { quoted: m });
        }
    }
};

// Función auxiliar si no tienes una librería de funciones
function getRandom(ext) {
    return `${Math.floor(Math.random() * 10000)}${ext}`;
}
