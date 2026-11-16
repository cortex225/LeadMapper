import { Place, SearchParams, SearchResult } from "@/types";

/*
 * Jeu de données de démonstration.
 * Les commerces sont fictifs : noms inventés, numéros en 555 (plage réservée à la fiction),
 * sites en .ca qui n'existent pas. Seuls les noms de rues et les centres-villes sont réels,
 * pour que la carte reste crédible. Le tirage est déterministe : même recherche, mêmes résultats.
 */

interface Sector {
  match: RegExp;
  category: string;
  types: string[];
  names: string[];
}

const SECTORS: Sector[] = [
  {
    match: /barb|coiff|hair/i,
    category: "Barbier",
    types: ["hair_care"],
    names: [
      "Barbier Saint-Denis",
      "Coupe Franche",
      "Le Rasoir d'Or",
      "Barbershop Masson",
      "Salon Chez Tony",
      "L'Atelier du Barbier",
      "Barbe & Ciseaux",
      "Studio Fade",
      "Barbier du Plateau",
      "Coiffure Gino",
      "Le Comptoir à Barbe",
      "Rasé de Près",
      "Barbier Beaubien",
      "Les Frères Lame",
      "Salon Rital",
      "Tondeuse & Fils",
    ],
  },
  {
    match: /resto|restaurant|bistro|food|manger/i,
    category: "Restaurant",
    types: ["restaurant"],
    names: [
      "Chez Lucienne",
      "Le Petit Rôtisseur",
      "Pho Bà Năm",
      "Casse-Croûte du Coin",
      "Trattoria Nonna Lina",
      "Le Bistro Masson",
      "Restaurant Mezzé",
      "Sushi Kaze",
      "La Belle Patate",
      "Brasserie Rachel",
      "Cantine Ontario",
      "Le Comptoir Portugais",
      "Taqueria Sol",
      "Dumplings Mei",
      "Chez Rémi Grill",
      "La Fringale",
    ],
  },
  {
    match: /caf[ée]|coffee|boulang|bakery|pâtiss|patiss/i,
    category: "Café",
    types: ["cafe", "bakery"],
    names: [
      "Café Lou",
      "Le Moulin à Grains",
      "Boulangerie Fournier",
      "Café du Square",
      "Pâtisserie Clément",
      "Brûlerie Laurier",
      "Le Petit Fournil",
      "Café Mileva",
      "Croissanterie Wellington",
      "Le Torréfacteur",
      "Café Bonheur d'Occasion",
      "Mie & Levain",
    ],
  },
  {
    match: /fleur|florist/i,
    category: "Fleuriste",
    types: ["florist", "store"],
    names: [
      "Fleurs de Saison",
      "L'Atelier Pétale",
      "Fleuriste Rosemont",
      "Bouquet Sauvage",
      "Les Jardins d'Hélène",
      "Fleuriste du Marché",
      "Tige & Feuille",
      "Floralie",
      "Le Comptoir Botanique",
      "Fleurs Masson",
    ],
  },
  {
    match: /garage|méca|meca|auto|car/i,
    category: "Garage",
    types: ["car_repair"],
    names: [
      "Garage Tremblay & Fils",
      "Mécanique Pro-Sud",
      "Auto Service Beaubien",
      "Garage Lacasse",
      "Pneus & Freins Ontario",
      "Centre Auto Rosemont",
      "Mécanique Gilles Roy",
      "Garage du Village",
      "Atelier Mécanique Côté",
      "Silencieux Express",
    ],
  },
  {
    match: /dent|clinique|physio|santé|sante/i,
    category: "Clinique",
    types: ["dentist", "physiotherapist"],
    names: [
      "Clinique Dentaire Laurier",
      "Centre Physio Masson",
      "Dentisterie du Parc",
      "Clinique Sourire",
      "Physio Plateau",
      "Centre Dentaire Saint-Hubert",
      "Clinique Mouvement",
      "Dentiste Dr Gagnon",
    ],
  },
];

interface City {
  label: string;
  area: string;
  /** Centres de quartiers (sur la terre ferme) autour desquels on place les commerces. */
  anchors: [number, number][];
  streets: string[];
}

const CITIES: Record<string, City> = {
  montreal: {
    label: "Montréal",
    area: "514",
    anchors: [
      [45.522, -73.58],
      [45.5415, -73.5855],
      [45.5245, -73.6],
      [45.5455, -73.6225],
      [45.5455, -73.5455],
      [45.4785, -73.584],
    ],
    streets: [
      "rue Saint-Denis",
      "boulevard Saint-Laurent",
      "avenue du Mont-Royal Est",
      "rue Masson",
      "rue Beaubien Est",
      "rue Ontario Est",
      "avenue Laurier Ouest",
      "rue Notre-Dame Ouest",
      "rue Rachel Est",
      "rue Saint-Hubert",
    ],
  },
  quebec: {
    label: "Québec",
    area: "418",
    anchors: [
      [46.8139, -71.224],
      [46.8035, -71.229],
      [46.8285, -71.226],
      [46.812, -71.241],
      [46.7785, -71.284],
    ],
    streets: [
      "rue Saint-Joseph Est",
      "avenue Cartier",
      "3e Avenue",
      "rue Saint-Jean",
      "chemin Sainte-Foy",
      "rue Saint-Vallier Ouest",
      "boulevard René-Lévesque Ouest",
    ],
  },
  laval: {
    label: "Laval",
    area: "450",
    anchors: [
      [45.537, -73.748],
      [45.556, -73.695],
      [45.601, -73.723],
      [45.585, -73.765],
    ],
    streets: [
      "boulevard des Laurentides",
      "boulevard Curé-Labelle",
      "boulevard de la Concorde Est",
      "boulevard Saint-Martin Ouest",
      "boulevard Lévesque Ouest",
    ],
  },
  longueuil: {
    label: "Longueuil",
    area: "450",
    anchors: [
      [45.535, -73.505],
      [45.499, -73.424],
      [45.486, -73.465],
    ],
    streets: ["chemin de Chambly", "rue Saint-Charles Ouest", "boulevard Taschereau", "rue Saint-Laurent Ouest"],
  },
  gatineau: {
    label: "Gatineau",
    area: "819",
    anchors: [
      [45.432, -75.718],
      [45.48, -75.65],
      [45.396, -75.84],
    ],
    streets: ["boulevard Saint-Joseph", "rue Principale", "boulevard Maloney Ouest", "rue Laval", "boulevard Gréber"],
  },
  sherbrooke: {
    label: "Sherbrooke",
    area: "819",
    anchors: [
      [45.403, -71.892],
      [45.41, -71.86],
      [45.39, -71.91],
      [45.395, -71.93],
    ],
    streets: ["rue King Ouest", "rue Wellington Nord", "boulevard de Portland", "rue Galt Ouest", "rue King Est"],
  },
  "trois-rivieres": {
    label: "Trois-Rivières",
    area: "819",
    anchors: [
      [46.347, -72.545],
      [46.372, -72.51],
      [46.356, -72.58],
    ],
    streets: ["rue des Forges", "boulevard des Récollets", "rue Notre-Dame Centre", "boulevard des Forges"],
  },
};

/** Générateur pseudo-aléatoire déterministe (mulberry32). */
function seededRandom(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function normalize(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim().replace(/\s+/g, "-");
}

function resolveCity(location: string) {
  const key = normalize(location);
  const match = Object.entries(CITIES).find(([k]) => key.includes(k));
  return match ? match[1] : CITIES.montreal;
}

function resolveSector(query: string): Sector {
  const found = SECTORS.find((s) => s.match.test(query));
  if (found) return found;
  const label = query.trim().replace(/^./, (c) => c.toUpperCase());
  return {
    match: /.*/,
    category: label,
    types: ["store"],
    names: ["Atelier", "Maison", "Studio", "Comptoir", "Boutique", "Centre", "L'Espace", "Le Coin"].map(
      (prefix, i) =>
        `${prefix} ${label} ${["Masson", "Laurier", "du Plateau", "Rosemont", "Ontario", "Wellington", "Saint-Denis", "Beaubien"][i]}`,
    ),
  };
}

function slug(name: string) {
  return normalize(name)
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "");
}

export function demoSearch(params: SearchParams): SearchResult {
  const city = resolveCity(params.location);
  const sector = resolveSector(params.query);
  const rand = seededRandom(`${normalize(params.query)}|${normalize(params.location)}|${params.radius}`);

  // Un rayon plus large ramène plus de commerces, comme sur Google Maps.
  const count = Math.min(sector.names.length, 8 + Math.round(params.radius / 2) + Math.floor(rand() * 4));
  const names = [...sector.names].sort(() => rand() - 0.5).slice(0, count);
  // Petit rayon : quelques quartiers seulement. Grand rayon : toute la ville.
  const anchors = city.anchors.slice(0, Math.max(2, Math.min(city.anchors.length, Math.ceil(params.radius / 2) + 1)));

  const places: Place[] = names.map((name) => {
    const hasWebsite = rand() > 0.6;
    const [anchorLat, anchorLng] = anchors[Math.floor(rand() * anchors.length)];
    const angle = rand() * Math.PI * 2;
    const distance = Math.sqrt(rand()) * 0.6;
    const lat = anchorLat + (distance / 111) * Math.sin(angle);
    const lng = anchorLng + (distance / (111 * Math.cos((anchorLat * Math.PI) / 180))) * Math.cos(angle);
    const unrated = rand() > 0.92;
    const rating = unrated ? undefined : Math.round((3.2 + rand() * 1.8) * 10) / 10;
    const reviewsCount = unrated ? undefined : Math.floor(Math.pow(rand(), 1.6) * 420) + 3;

    return {
      placeId: `demo-${slug(city.label)}-${slug(name)}`,
      name,
      category: sector.category,
      types: sector.types,
      address: `${100 + Math.floor(rand() * 6800)}, ${city.streets[Math.floor(rand() * city.streets.length)]}, ${city.label}, QC`,
      phone: rand() > 0.08 ? `(${city.area}) 555-01${String(Math.floor(rand() * 100)).padStart(2, "0")}` : undefined,
      website: hasWebsite ? `https://www.${slug(name)}.ca` : undefined,
      rating,
      reviewsCount,
      lat,
      lng,
    };
  });

  return { places, center: { lat: city.anchors[0][0], lng: city.anchors[0][1] }, source: "demo" };
}

export const DEMO_EXAMPLES = [
  { query: "Barbier", location: "Montréal" },
  { query: "Restaurant", location: "Québec" },
  { query: "Fleuriste", location: "Laval" },
];
