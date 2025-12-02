import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import qrcode from "qrcode";
import { Client, LocalAuth, MessageMedia } from "whatsapp-web.js";

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));

let qrData = null;
let clientReady = false;

// WhatsApp Client
const client = new Client({
  authStrategy: new LocalAuth(), // guarda sesión en .wwebjs_auth
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  }
});

// QR event
client.on("qr", async (qr) => {
  qrData = await qrcode.toDataURL(qr);
});

// Ready event
client.on("ready", () => {
  clientReady = true;
  console.log("WhatsApp: Conectado");
});

// Init
client.initialize();

// ------------------------------------------
// API ENDPOINTS
// ------------------------------------------

app.get("/qr", (req, res) => {
  res.json({
    qr: qrData,
    ready: clientReady
  });
});

app.get("/status", (req, res) => {
  res.json({
    ready: clientReady
  });
});

app.post("/send-message", async (req, res) => {
  try {
    const { number, message } = req.body;

    if (!clientReady) return res.status(400).json({ error: "WhatsApp no está conectado" });

    await client.sendMessage(formatNumber(number), message);
    res.json({ status: "sent" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/send-media", async (req, res) => {
  try {
    const { number, mediaBase64, filename, mimetype } = req.body;
    const media = new MessageMedia(mimetype, mediaBase64, filename);

    await client.sendMessage(formatNumber(number), media);
    res.json({ status: "sent" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// helper
function formatNumber(num) {
  const clean = num.replace(/\D/g, "");
  return clean + "@c.us";
}

// Run server
app.listen(3000, () => {
  console.log("API WhatsApp corriendo en http://localhost:3000");
});
