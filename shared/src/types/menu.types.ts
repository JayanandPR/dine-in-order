export type FoodDietType = 'veg' | 'non-veg' | 'vegan';

export interface ICategory {
  id: string;
  name: string;
  restaurantId: string;
}

export interface IFoodItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  price: number;
  description: string;
  stock: number;
  availability: boolean;
  dietType: FoodDietType;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}
