export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';

export interface ICartItem {
  id: string;
  tableId: string;
  foodItemId: string;
  quantity: number;
  totalPrice: number;
  isOrdered: boolean;
}

export interface IOrder {
  id: string;
  restaurantId: string;
  tableId: string;
  items: {
    foodItemId: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  status: OrderStatus;
  totalAmount: number;
  orderedAt: Date;
}

export interface IBill {
  id: string;
  orderId: string;
  tableId: string;
  totalPayableAmount: number;
  isPaid: boolean;
  paymentId?: string;
  generatedAt: Date;
}

export type WsEventType =
  | 'order:new'
  | 'order:status_update'
  | 'table:status_update'
  | 'bill:generated';

export interface WsMessage<T = unknown> {
  event: WsEventType;
  restaurantId: string;
  payload: T;
}
