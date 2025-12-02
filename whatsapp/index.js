const express = require("express");
const qrcode = require("qrcode");
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");

const app = express();
app.use(express.json());

let qrData = null;

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './wwebjs_auth'
    }),
    puppeteer: {
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        headless: true
    }
});

// EVENTO QR
client.on("qr", async (qr) => {
    console.log("📲 Nuevo QR generado");
    qrData = qr; 
});

// EVENTO READY
client.on("ready", () => {
    console.log("✅ WhatsApp conectado y listo");
});

// LOG DE ERRORES
client.on("auth_failure", () => console.log("❌ Falló la autenticación"));
client.on("disconnected", () => console.log("⚠ Cliente desconectado"));

client.initialize();

// ============ ENDPOINTS ============

// QR como imagen PNG
app.get("/qr.png", async (req, res) => {
    if (!qrData) return res.status(404).send("QR no disponible");

    const png = await qrcode.toBuffer(qrData);
    res.setHeader("Content-Type", "image/png");
    res.send(png);
});

// Enviar mensaje
app.post("/send-message", async (req, res) => {
    try {
        let { number, message } = req.body;
        
        if (!number || !message) {
            return res.status(400).json({ error: "Falta number o message" });
        }

        number = number + "@c.us";

        await client.sendMessage(number, message);

        console.log(`📤 Mensaje enviado a ${number}`);

        res.json({ status: "ok" });
    } catch (err) {
        console.error("❌ Error enviando mensaje", err);
        res.status(500).json({ error: "Error interno" });
    }
});

// Servidor web interno
app.listen(3000, () => {
    console.log("🌐 API WhatsApp lista en puerto 3000 (interno Docker)");
});
