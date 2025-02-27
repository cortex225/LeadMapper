// Serveur proxy simple pour éviter les problèmes CORS avec l'API Google Maps
import express from "express";
import cors from "cors";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

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
if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
  // Vercel gère les fichiers statiques automatiquement,
  // mais nous gardons cette logique pour les autres environnements de production
  const distPath = path.join(__dirname, "../../dist");

  try {
    app.use(express.static(distPath));

    app.get("*", (req, res) => {
      if (req.path.startsWith("/api/")) {
        return; // Laisser les routes API être gérées par leurs gestionnaires
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  } catch (error) {
    console.error("Error serving static files:", error);
  }
}

// Démarrer le serveur
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
  });
}

export default app;
