export type CreateProductDTO = {
  name: string;
  description: string;
  price: number;
  photos: string[];
};

export type UpdateProductDTO = {
  name?: string;
  description?: string;
  price?: number;
  isAvailable?: boolean;
};
