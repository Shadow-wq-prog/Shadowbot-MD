const fs = require('fs');
const path = require('path');

module.exports = {
    command: ['del', 'borrar', 'delete'],
    run: async (sock, m, from, args) => {
        // SEGURIDAD: Solo el dueño puede borrar (Fernando)
        // Puedes poner tu número aquí si quieres restringirlo más
        
        if (!args[0]) return sock.sendMessage(from, { text: '⚠️ *Uso:* .del [nombre del archivo]\n\n*Ejemplo:* .del test.js' });

        const fileName = args[0].endsWith('.js') ? args[0] : `${args[0]}.js`;
        const filePath = path.join(__dirname, fileName);

        if (fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath); // Borra el archivo físicamente
                await sock.sendMessage(from, { text: `✅ *Archivo "${fileName}" eliminado con éxito.*` });
                
                // Reiniciamos el proceso para que el bot ya no lo cuente
                setTimeout(() => {
                    process.exit();
                }, 2000);
            } catch (err) {
                await sock.sendMessage(from, { text: `❌ *Error al borrar:* ${err.message}` });
            }
        } else {
            await sock.sendMessage(from, { text: `🔎 *No encontré el archivo:* ${fileName}\n\nUsa *.menu* para ver la lista de archivos.` });
        }
    }
};
