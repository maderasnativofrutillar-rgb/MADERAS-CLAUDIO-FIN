import { Timestamp } from "firebase/firestore";

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    dataAiHint?: string;
    createdAt?: Timestamp;
  }
  
  export interface CartItem extends Product {
    quantity: number;
  }
  