import { Lead, SearchParams } from "../types";
import { v4 as uuidv4 } from "uuid";

// Clé API Google Maps depuis les variables d'environnement
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Interface pour les détails d'un lieu Google Places
interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
  types?: string[];
  user_ratings_total?: number;
  // L'API Google Places ne fournit pas directement les emails
}

// Fonction pour calculer le score de potentiel d'un client
const calculatePotentialScore = (
  place: PlaceDetails,
  hasWebsite: boolean
): number => {
  let score = 0;

  // Facteur 1: Absence de site web (le plus important)
  if (!hasWebsite) {
    score += 50; // 50 points si pas de site web
  }

  // Facteur 2: Évaluation (rating)
  if (place.rating) {
    if (place.rating >= 4.5) {
      score += 20; // Excellente évaluation = haut potentiel
    } else if (place.rating >= 4.0) {
      score += 15;
    } else if (place.rating >= 3.5) {
      score += 10;
    } else if (place.rating >= 3.0) {
      score += 5;
    }
  } else {
    score += 10; // Pas d'évaluation = potentiel moyen
  }

  // Facteur 3: Nombre d'avis
  if (place.user_ratings_total) {
    if (place.user_ratings_total >= 100) {
      score += 20; // Beaucoup d'avis = entreprise établie
    } else if (place.user_ratings_total >= 50) {
      score += 15;
    } else if (place.user_ratings_total >= 20) {
      score += 10;
    } else if (place.user_ratings_total >= 5) {
      score += 5;
    }
  }

  // Facteur 4: Type d'entreprise (certains types ont plus besoin de sites web)
  const highPotentialTypes = [
    "restaurant",
    "cafe",
    "bar",
    "hotel",
    "lodging",
    "store",
    "retail",
    "beauty_salon",
    "hair_care",
    "spa",
    "gym",
    "health",
    "real_estate_agency",
    "lawyer",
    "doctor",
    "dentist",
    "physiotherapist",
    "school",
    "university",
  ];

  if (place.types) {
    for (const type of place.types) {
      if (highPotentialTypes.includes(type.toLowerCase())) {
        score += 10;
        break; // Ne compter qu'une seule fois
      }
    }
  }

  // Limiter le score à 100
  return Math.min(score, 100);
};

// Fonction pour déterminer la catégorie de potentiel
const getPotentialCategory = (score: number): "low" | "medium" | "high" => {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
};

// Fonction pour générer un email basé sur le nom de l'entreprise et son site web
const generateEmailFromBusinessInfo = (
  businessName: string,
  website?: string
): string | undefined => {
  // Si l'entreprise n'a pas de site web, il est moins probable qu'elle ait un email professionnel
  if (!website) return undefined;

  try {
    // Extraire le domaine du site web
    const domain = website
      .replace(/^https?:\/\//i, "")
      .replace(/^www\./i, "")
      .split("/")[0];

    // Créer un email professionnel basé sur le domaine
    const emailPrefixes = ["contact", "info", "hello", "bonjour", "service"];
    const emailPrefix =
      emailPrefixes[Math.floor(Math.random() * emailPrefixes.length)];

    return `${emailPrefix}@${domain}`;
  } catch {
    // En cas d'erreur, générer un email basé sur le nom de l'entreprise
    const emailPrefix = businessName
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, ".")
      .substring(0, 15);

    const domains = ["gmail.com", "outlook.com", "yahoo.fr", "hotmail.com"];
    const domain = domains[Math.floor(Math.random() * domains.length)];

    return `${emailPrefix}@${domain}`;
  }
};

// Fonction pour rechercher des entreprises via l'API Google Places
export const searchBusinesses = async (
  params: SearchParams
): Promise<Lead[]> => {
  try {
    // Construire l'URL pour la recherche textuelle de lieux
    const baseUrl =
      "https://maps.googleapis.com/maps/api/place/textsearch/json";

    // Vérifier si la localisation est au format coordonnées (contient une virgule et pas d'espace)
    const isCoordinates =
      params.location.includes(",") && !params.location.includes(" ");

    let apiUrl;
    if (isCoordinates) {
      // Si c'est des coordonnées, utiliser le format location=lat,lng
      apiUrl = `${baseUrl}?query=${encodeURIComponent(params.query)}&location=${
        params.location
      }&radius=${params.radius * 1000}&key=${API_KEY}`;
    } else {
      // Sinon, utiliser le format query=type in location
      const query = `${params.query} in ${params.location}`;
      apiUrl = `${baseUrl}?query=${encodeURIComponent(query)}&radius=${
        params.radius * 1000
      }&key=${API_KEY}`;
    }

    // Appel à l'API Google Places via un proxy pour éviter les problèmes CORS
    const response = await fetch(
      `/api/proxy?url=${encodeURIComponent(apiUrl)}`
    );

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      throw new Error(`Erreur Google API: ${data.status}`);
    }

    // Transformer les résultats en format Lead
    const leads: Lead[] = [];

    if (data.results && data.results.length > 0) {
      // Pour chaque résultat, obtenir plus de détails
      for (const place of data.results) {
        try {
          // Récupérer les détails complets du lieu
          const placeDetails = await getPlaceDetails(place.place_id);

          // Vérifier si le lieu a un site web
          const hasWebsite = Boolean(placeDetails.website);

          // Calculer le score de potentiel
          const potentialScore = calculatePotentialScore(
            placeDetails,
            hasWebsite
          );
          const potentialCategory = getPotentialCategory(potentialScore);

          // Générer un email basé sur les informations de l'entreprise
          const email = generateEmailFromBusinessInfo(
            placeDetails.name || place.name,
            placeDetails.website
          );

          leads.push({
            id: uuidv4(),
            businessName: placeDetails.name || place.name,
            category: place.types?.[0] || "Business",
            address:
              placeDetails.formatted_address || place.formatted_address || "",
            phone: placeDetails.formatted_phone_number,
            website: placeDetails.website,
            email: email, // Utiliser l'email généré
            rating: placeDetails.rating || place.rating,
            hasWebsite,
            notes: "",
            dateAdded: new Date().toISOString().split("T")[0],
            potentialScore,
            potentialCategory,
          });
        } catch (error) {
          console.error(
            `Erreur lors de la récupération des détails pour ${place.name}:`,
            error
          );
          // Ajouter quand même le lieu avec les informations limitées
          leads.push({
            id: uuidv4(),
            businessName: place.name,
            category: place.types?.[0] || "Business",
            address: place.formatted_address || "",
            phone: undefined,
            website: undefined,
            email: undefined,
            rating: place.rating,
            hasWebsite: false,
            notes: "",
            dateAdded: new Date().toISOString().split("T")[0],
            potentialScore: 50, // Score par défaut pour les lieux sans détails
            potentialCategory: "medium",
          });
        }
      }
    }

    return leads;
  } catch (error) {
    console.error("Erreur lors de la recherche d'entreprises:", error);
    throw error;
  }
};

// Fonction pour obtenir plus de détails sur un lieu spécifique
export const getPlaceDetails = async (
  placeId: string
): Promise<PlaceDetails> => {
  try {
    const baseUrl = "https://maps.googleapis.com/maps/api/place/details/json";

    const response = await fetch(
      `/api/proxy?url=${encodeURIComponent(
        `${baseUrl}?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,rating,types,user_ratings_total&key=${API_KEY}`
      )}`
    );

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== "OK") {
      throw new Error(`Erreur Google API: ${data.status}`);
    }

    return data.result;
  } catch (error) {
    console.error("Erreur lors de la récupération des détails du lieu:", error);
    throw error;
  }
};
