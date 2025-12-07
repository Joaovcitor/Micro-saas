export type CreateOrderDto = {
  storeId: string;
  enderecoEntrega?: string;
  metodoPagamento: string;
  items: OrderItemDto[];
  customizations: OrderCustomizationDto[];
};

export type OrderItemCustomizationDTOCreate = {
  orderItemId: string;
  customizationId: string;
  optionId: string;
  quantity: number;
  price: number;
  name: string;
};

export type OrderCustomizationDto = {
  optionId: string;
  value: number;
};

export type OrderItemDto = {
  productId: string;
  quantity: number;
  customizations?: OrderCustomizationItems[];
};

export type OrderCustomizationItems = {
  optionId: string;
  value: number;
  name: string;
  price: number;
  quantity: number;
};

export type OrderResponseDto = {
  id: string;
  userId: string;
  status: string;
  orderItems: OrderItemResponseDto[];
  metodoPagamento: string;
  user?: {
    name: string;
    email: string;
  };
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
};

export type OrderItemResponseDto = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
};

export type UpdateOrderStatusDto = {
  status: string;
};
