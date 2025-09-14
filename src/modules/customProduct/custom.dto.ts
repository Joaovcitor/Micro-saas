export type ProductCustomizationDTOCreate = {
  productId: number;
  name: string;
  description: string;
  isRequired: boolean;
  minOptions: number;
  maxOptions: number;
  options: CustomizationOptionDTOCreate[];
};

export type CustomizationOptionDTOCreate = {
  customizationId: number;
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
  maxQuantity: number;
  order: number;
  options: OrderItemCustomizationDTOCreate[];
};

export type OrderItemCustomizationDTOCreate = {
  orderItemId: number;
  customizationId: number;
  optionId: number;
  quantity: number;
  price: number;
  name: string;
};
