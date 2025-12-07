export type ProductCustomizationDTOCreate = {
  productId: string;
  name: string;
  description: string;
  isRequired: boolean;
  minOptions: number;
  maxOptions: number;
  options: CustomizationOptionDTOCreate[];
};

export type CustomizationOptionDTOCreate = {
  customizationId: string;
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
  maxQuantity: number;
  order: number;
  options: OrderItemCustomizationDTOCreate[];
};

export type OrderItemCustomizationDTOCreate = {
  orderItemId: string;
  customizationId: string;
  optionId: string;
  quantity: number;
  price: number;
  name: string;
};
