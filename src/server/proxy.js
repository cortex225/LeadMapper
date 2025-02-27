// Serveur proxy simple pour éviter les problèmes CORS avec l'API Google Maps
import express from "express";
import cors from "cors";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://lead-mapper.vercel.app",
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    ].filter(Boolean),
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json());

// Route pour le proxy API
app.get("/api/proxy", async (req, res) => {
  try {
    const url = req.query.url;

    if (!url) {
      return res.status(400).json({ error: "URL parameter is required" });
    }

    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error("Proxy error:", error.message);
    res.status(500).json({
      error: "Proxy request failed",
      details: error.message,
    });
  }
});

// Vérification de l'état du serveur
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Servir les fichiers statiques en production
// Note: Dans un environnement serverless comme Vercel, cette partie est gérée par les rewrites
// dans le fichier vercel.json, mais nous la gardons pour les tests locaux
if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
  try {
    const distPath = path.join(__dirname, "../../dist");
    app.use(express.static(distPath));
  } catch (error) {
    console.error("Error serving static files:", error);
  }
}

// En environnement de développement local, nous démarrons le serveur
// En production sur Vercel, ce code ne sera pas exécuté car Vercel utilise le module exporté
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
  });
}

// Exporter l'application Express pour Vercel
export default app;
