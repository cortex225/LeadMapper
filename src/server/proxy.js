// API de recherche : interroge Google Places côté serveur pour que la clé ne quitte jamais le serveur.
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const PLACES = "https://maps.googleapis.com/maps/api/place";
const MAX_RESULTS = 20;
const ALLOWED_RADII = new Set([1, 2, 5, 10, 20]);

const app = express();
app.set("trust proxy", 1);

// Limite simple par IP : chaque recherche coûte jusqu'à 21 appels facturés à Google.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_SEARCHES = 20;
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_SEARCHES;
}

function readParams(query) {
  const text = typeof query.query === "string" ? query.query.trim() : "";
  const location = typeof query.location === "string" ? query.location.trim() : "";
  const radius = Number(query.radius);
  if (!text || text.length > 80) return { error: "Indiquez un type de commerce (80 caractères max)." };
  if (!location || location.length > 80) return { error: "Indiquez une ville ou des coordonnées (80 caractères max)." };
  if (!ALLOWED_RADII.has(radius)) return { error: "Rayon invalide : choisissez 1, 2, 5, 10 ou 20 km." };
  return { text, location, radius };
}

async function placesGet(endpoint, params) {
  const url = new URL(`${PLACES}/${endpoint}/json`);
  for (const [key, value] of Object.entries({ ...params, key: API_KEY, language: "fr" })) {
    url.searchParams.set(key, String(value));
  }
  const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(`Google Places HTTP ${response.status}`);
  const data = await response.json();
  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(`Google Places ${data.status}`);
  }
  return data;
}

// Libellés français des types Google les plus courants ; les types génériques sont ignorés.
const TYPE_LABELS = {
  hair_care: "Coiffure et barbier",
  beauty_salon: "Salon de beauté",
  spa: "Spa",
  restaurant: "Restaurant",
  cafe: "Café",
  bakery: "Boulangerie",
  bar: "Bar",
  meal_takeaway: "Plats à emporter",
  florist: "Fleuriste",
  car_repair: "Garage",
  dentist: "Dentiste",
  physiotherapist: "Physiothérapie",
  doctor: "Clinique",
  gym: "Salle de sport",
  lodging: "Hébergement",
  lawyer: "Avocat",
  real_estate_agency: "Agence immobilière",
  plumber: "Plombier",
  electrician: "Électricien",
  clothing_store: "Boutique de vêtements",
  store: "Commerce",
};

function categoryOf(types = []) {
  const known = types.find((t) => TYPE_LABELS[t]);
  return known ? TYPE_LABELS[known] : "Commerce";
}

function cleanAddress(address = "") {
  return address.replace(/,\s*Canada$/, "");
}

function toPlace(summary, details = {}) {
  const location = summary.geometry?.location ?? {};
  return {
    placeId: summary.place_id,
    name: details.name ?? summary.name,
    category: categoryOf(summary.types),
    types: summary.types ?? [],
    address: cleanAddress(details.formatted_address ?? summary.formatted_address),
    phone: details.formatted_phone_number,
    website: details.website,
    rating: details.rating ?? summary.rating,
    reviewsCount: details.user_ratings_total ?? summary.user_ratings_total,
    lat: location.lat,
    lng: location.lng,
  };
}

app.get("/api/search", async (req, res) => {
  if (!API_KEY) {
    return res.status(503).json({ error: "Clé Google Places absente côté serveur (GOOGLE_MAPS_API_KEY)." });
  }
  if (rateLimited(req.ip)) {
    return res.status(429).json({ error: "Trop de recherches d'affilée. Réessayez dans quelques minutes." });
  }
  const params = readParams(req.query);
  if (params.error) return res.status(400).json({ error: params.error });

  try {
    const isCoordinates = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(params.location);
    const search = await placesGet(
      "textsearch",
      isCoordinates
        ? { query: params.text, location: params.location, radius: params.radius * 1000 }
        : { query: `${params.text} ${params.location}`, radius: params.radius * 1000 },
    );

    const summaries = (search.results ?? []).slice(0, MAX_RESULTS);
    const places = await Promise.all(
      summaries.map(async (summary) => {
        try {
          const { result } = await placesGet("details", {
            place_id: summary.place_id,
            fields: "name,formatted_address,formatted_phone_number,website,rating,user_ratings_total",
          });
          return toPlace(summary, result);
        } catch {
          return toPlace(summary);
        }
      }),
    );

    const located = places.filter((p) => typeof p.lat === "number" && typeof p.lng === "number");
    const center = located.length
      ? {
          lat: located.reduce((sum, p) => sum + p.lat, 0) / located.length,
          lng: located.reduce((sum, p) => sum + p.lng, 0) / located.length,
        }
      : { lat: 45.5232, lng: -73.5833 };

    res.json({ places: located, center });
  } catch (error) {
    console.error("Recherche Google Places échouée :", error.message);
    res.status(502).json({ error: "Google Places n'a pas répondu correctement. Réessayez dans un instant." });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", googlePlaces: Boolean(API_KEY) });
});

if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
  app.use(express.static(path.join(__dirname, "../../dist")));
}

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`API LeadMapper sur http://localhost:${PORT}`));
}

export default app;
