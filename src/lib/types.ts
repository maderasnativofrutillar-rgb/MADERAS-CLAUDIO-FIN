
export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string; // Primary image
    images?: string[]; // Gallery images
    categories?: string[];
    dataAiHint?: string;
    createdAt?: any;
    
    // Wholesale pricing tiers
    wholesalePrice3?: number;
    wholesalePrice6?: number;
    wholesalePrice9?: number;

    // Offer
    offerPercentage?: number;

    // Custom Tag
    customTag?: string;
  }
  
  export interface CartItem extends Product {
    quantity: number;
  }

  export interface SiteImages {
    hero: string;
    essence: string;
    about: string;
    portfolio: string[];
  }
  
