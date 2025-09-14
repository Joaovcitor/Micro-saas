export type CreateOrderDto = {
  enderecoEntrega?: string;
  metodoPagamento: string;
  items: OrderItemDto[];
  customizations: OrderCustomizationDto[];
};

export type OrderItemCustomizationDTOCreate = {
  orderItemId: number;
  customizationId: number;
  optionId: number;
  quantity: number;
  price: number;
  name: string;
};

export type OrderCustomizationDto = {
  optionId: number;
  value: number;
};

export type OrderItemDto = {
  productId: number;
  quantity: number;
  customizations?: OrderCustomizationItems[];
};

export type OrderCustomizationItems = {
  optionId: number;
  value: number;
  name: string;
  price: number;
  quantity: number;
};

export type OrderResponseDto = {
  id: number;
  userId: number;
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
