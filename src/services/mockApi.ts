import { Lead, SearchParams } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Mock business categories
const businessCategories = [
  'Restaurant', 'Cafe', 'Retail Store', 'Hotel', 
  'Bakery', 'Salon', 'Gym', 'Boutique', 
  'Real Estate Agency', 'Law Firm', 'Medical Practice',
  'Construction Company', 'Photography Studio'
];

// Mock business name prefixes
const businessNamePrefixes = [
  'Royal', 'Elite', 'Premium', 'Golden', 'Silver', 
  'Diamond', 'Luxury', 'Classic', 'Modern', 'Urban',
  'Coastal', 'Mountain', 'River', 'Forest', 'Sunset'
];

// Mock business name suffixes
const businessNameSuffixes = [
  'Solutions', 'Services', 'Group', 'Inc.', 'LLC',
  'Co.', 'Associates', 'Partners', 'Enterprises', 'International'
];

// Generate a random business name
const generateBusinessName = (category: string): string => {
  if (Math.random() > 0.7) {
    // Use prefix + category
    const prefix = businessNamePrefixes[Math.floor(Math.random() * businessNamePrefixes.length)];
    return `${prefix} ${category}`;
  } else if (Math.random() > 0.5) {
    // Use owner name style
    const firstNames = ['John', 'Mary', 'David', 'Sarah', 'Michael', 'Emma', 'Robert', 'Jennifer'];
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    return `${firstName}'s ${category}`;
  } else {
    // Use business name + suffix
    const suffix = businessNameSuffixes[Math.floor(Math.random() * businessNameSuffixes.length)];
    return `${category} ${suffix}`;
  }
};

// Generate a random address
const generateAddress = (location: string): string => {
  const streetNumbers = Math.floor(Math.random() * 1000) + 1;
  const streets = ['Main St', 'Oak Ave', 'Maple Rd', 'Park Blvd', 'Washington St', 'Broadway', 'Market St'];
  const street = streets[Math.floor(Math.random() * streets.length)];
  return `${streetNumbers} ${street}, ${location}`;
};

// Generate a random phone number
const generatePhone = (): string => {
  return `+1 (${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
};

// Generate a random website (or none)
const generateWebsite = (businessName: string, hasWebsite: boolean): string | undefined => {
  if (!hasWebsite) return undefined;
  
  // Convert business name to domain-friendly format
  const domain = businessName
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, '')
    .substring(0, 15);
  
  const tlds = ['.com', '.net', '.org', '.co', '.io'];
  const tld = tlds[Math.floor(Math.random() * tlds.length)];
  
  return `https://www.${domain}${tld}`;
};

// Generate a random email (or none)
const generateEmail = (businessName: string): string | undefined => {
  if (Math.random() > 0.7) return undefined;
  
  // Convert business name to email-friendly format
  const emailPrefix = businessName
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, '.')
    .substring(0, 15);
  
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  
  return `${emailPrefix}@${domain}`;
};

// Generate a random rating (or none)
const generateRating = (): number | undefined => {
  if (Math.random() > 0.9) return undefined;
  return parseFloat((Math.random() * 3 + 2).toFixed(1)); // Rating between 2.0 and 5.0
};

// Mock API function to search for businesses
export const searchBusinesses = async (params: SearchParams): Promise<Lead[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Generate random number of results (5-20)
  const numResults = Math.floor(Math.random() * 16) + 5;
  const results: Lead[] = [];
  
  // If query is empty, return empty results
  if (!params.query.trim() || !params.location.trim()) {
    return [];
  }
  
  // Determine category based on query or use random categories
  let categories: string[] = [];
  if (params.query.toLowerCase().includes('restaurant')) {
    categories = ['Restaurant', 'Cafe', 'Bistro', 'Diner', 'Eatery'];
  } else if (params.query.toLowerCase().includes('hotel')) {
    categories = ['Hotel', 'Motel', 'Inn', 'Resort', 'Bed & Breakfast'];
  } else if (params.query.toLowerCase().includes('retail')) {
    categories = ['Retail Store', 'Boutique', 'Shop', 'Market', 'Outlet'];
  } else {
    // Use the query as the category or pick from predefined categories
    const matchingCategories = businessCategories.filter(cat => 
      cat.toLowerCase().includes(params.query.toLowerCase())
    );
    
    categories = matchingCategories.length > 0 ? matchingCategories : [params.query];
  }
  
  // Generate random leads
  for (let i = 0; i < numResults; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const hasWebsite = Math.random() > 0.6; // 40% chance of not having a website
    const businessName = generateBusinessName(category);
    
    results.push({
      id: uuidv4(),
      businessName,
      category,
      address: generateAddress(params.location),
      phone: generatePhone(),
      website: generateWebsite(businessName, hasWebsite),
      email: generateEmail(businessName),
      rating: generateRating(),
      hasWebsite,
      notes: '',
      dateAdded: new Date().toISOString().split('T')[0]
    });
  }
  
  return results;
};