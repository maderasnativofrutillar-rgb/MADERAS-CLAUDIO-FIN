import { Timestamp } from "firebase/firestore";

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string; // Primary image
    images?: string[]; // Gallery images
    dataAiHint?: string;
    createdAt?: Timestamp;
  }
  
  export interface CartItem extends Product {
    quantity: number;
  }
  