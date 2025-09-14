export type CreateProductDTO = {
  name: string;
  description: string;
  price: number;
  quantity: number;
  photos: string[];
};

export type UpdateProductDTO = {
  name?: string;
  description?: string;
  price?: number;
  isAvailable?: boolean;
  photos?: string[];
};
