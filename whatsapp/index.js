import express from "express";
import qrcode from "qrcode";
import { Client, LocalAuth } from "whatsapp-web.js";

const app = express();
app.use(express.json());

// WhatsApp client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
});

// Generar QR en variable temporal
let qrImage = null;

// Eventos
client.on("qr", async (qr) => {
    qrImage = await qrcode.toDataURL(qr);
    console.log("QR actualizado, listo para escanear.");
});

client.on("ready", () => {
    console.log("WhatsApp conectado exitosamente.");
});

client.on("authenticated", () => {
    console.log("Autenticado!");
});

client.on("auth_failure", msg => {
    console.log("ERROR de autenticación:", msg);
});

// Endpoints
app.get("/qr.png", (req, res) => {
    if (!qrImage) return res.status(503).send("QR aún no generado.");
    const base64 = qrImage.split(",")[1];
    const buffer = Buffer.from(base64, "base64");
    res.setHeader("Content-Type", "image/png");
    res.send(buffer);
});

app.post("/send-message", async (req, res) => {
    const { number, message } = req.body;

    if (!number || !message)
        return res.status(400).json({ error: "number y message son requeridos" });

    try {
        const finalNumber = number.includes("@c.us")
            ? number
            : `${number}@c.us`;

        await client.sendMessage(finalNumber, message);

        res.json({ status: "sent", number, message });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al enviar mensaje" });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log("API lista en puerto", PORT));
client.initialize();
