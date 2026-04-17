export interface Subcategory {
  id: string;
  name: string;
  icon?: string;
  image?: string;
}

export interface Category {
  id: string;
  name: string;
  subcategories: Subcategory[];
}

export interface Product {
  id: string;
  subcategoryId: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  weightOrVolume: string;
  isAd?: boolean;
  rating?: number;
  ratingCount?: number;
  timeToDeliver?: string;
  image: string;
  discountPercentage?: number;
}
