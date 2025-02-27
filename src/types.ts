export interface Lead {
  id: string;
  businessName: string;
  address: string;
  phone?: string;
  website?: string;
  email?: string;
  category: string;
  rating?: number;
  hasWebsite: boolean;
  notes?: string;
  dateAdded: string;
  potentialScore?: number;
  potentialCategory?: "low" | "medium" | "high";
}

export interface SearchParams {
  query: string;
  location: string;
  radius: number;
}
