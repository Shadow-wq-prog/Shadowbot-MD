import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

export default {
    command: ['toimg', 'tovideo'],
    category: 'multimedia',
    run: async (sock, m, args) => {
        const from = m.key.remoteJid;
        const quoted = m.quoted ? m.quoted : m;
        const mime = (quoted.msg || quoted).mimetype || '';

        if (!/webp/.test(mime)) {
            return sock.sendMessage(from, { text: '⚠️ Responde a un sticker.' }, { quoted: m });
        }

        try {
            const media = await quoted.download();
            const isAnimated = quoted.msg.isAnimated;
            const tmpDir = path.join(process.cwd(), 'tmp');
            if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

            const inputPath = path.join(tmpDir, `${Date.now()}.webp`);
            const outputPath = path.join(tmpDir, `${Date.now()}${isAnimated ? '.mp4' : '.jpg'}`);

            fs.writeFileSync(inputPath, media);

            const cmd = isAnimated 
                ? `ffmpeg -i ${inputPath} -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ${outputPath}`
                : `ffmpeg -i ${inputPath} ${outputPath}`;

            exec(cmd, async (err) => {
                if (err) throw err;
                const buffer = fs.readFileSync(outputPath);
                if (isAnimated) {
                    await sock.sendMessage(from, { video: buffer, caption: '✅ Video listo.' }, { quoted: m });
                } else {
                    await sock.sendMessage(from, { image: buffer, caption: '✅ Imagen lista.' }, { quoted: m });
                }
                fs.unlinkSync(inputPath);
                fs.unlinkSync(outputPath);
            });
        } catch (e) {
            await sock.sendMessage(from, { text: `❌ Error: ${e.message}` }, { quoted: m });
        }
    }
};
