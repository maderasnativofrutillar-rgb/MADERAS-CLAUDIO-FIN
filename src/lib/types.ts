

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
    // New fields for wholesale and offers
    wholesaleEnabled?: boolean;
    wholesaleMinQuantity?: number;
    offerPercentage?: number;
  }
  
  export interface CartItem extends Product {
    quantity: number;
  }
  
