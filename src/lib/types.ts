
export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string; // Primary image
    images?: string[]; // Gallery images
    categories?: string[];
    dataAiHint?: string;
    // Allow createdAt to be a string for client-side components
    createdAt?: any;
  }
  
  export interface CartItem extends Product {
    quantity: number;
  }
  
