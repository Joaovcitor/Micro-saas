export type CreateOrderDto = {
  items: OrderItemDto[];
};

export type OrderItemDto = {
  productId: number;
  quantity: number;
};

export type OrderResponseDto = {
  id: number;
  userId: number;
  status: string;
  orderItems: OrderItemResponseDto[];
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
};

export type OrderItemResponseDto = {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
};

export type UpdateOrderStatusDto = {
  status: string;
};
