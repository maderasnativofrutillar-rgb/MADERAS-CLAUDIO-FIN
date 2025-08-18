
export interface Product {
    id: string;
    name: string;
    summary?: string;
    description: string;
    price: number; // Legacy price, now acts as a fallback or base for single unit.
    image: string; // Primary image
    images?: string[]; // Gallery images
    categories?: string[];
    dataAiHint?: string;
    createdAt?: any;
    
    // New bundle pricing
    priceFor1?: number; // Price for a single unit
    priceFor2?: number; // Total price for 2 units
    priceFor3?: number; // Total price for 3 or more units

    // Offer
    offerPercentage?: number;

    // Custom Tag
    customTag?: string;

    // Specifications
    width?: number;
    length?: number;
    thickness?: number;
    woodType?: string;
    madeIn?: string;
    curing?: string;
  }
  
  export interface CartItem extends Product {
    quantity: number;
  }

  export interface SiteImages {
    hero: string;
    essence: string;
    about: string;
    portfolio: string[];
    logo: string;
    favicon: string;
    paymentMethods: string;
    instagramIcon?: string;
    tiktokIcon?: string;
  }
  
