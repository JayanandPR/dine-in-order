export type DietType = 'veg' | 'non-veg' | 'both';
export type CuisineType = 'indian' | 'chinese' | 'italian' | 'continental' | 'multi';

export interface IRestaurant {
  id: string;
  name: string;
  address: string;
  contactNumber: string;
  contactEmail: string;
  opensAt: string;
  closesAt: string;
  dietType: DietType;
  cuisineType: CuisineType;
  averageRating: number;
  noOfTables: number;
  logo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITable {
  id: string;
  restaurantId: string;
  tableNo: number;
  tableCapacity: number;
  status: 'available' | 'occupied' | 'reserved';
  qrCode?: string;
}
