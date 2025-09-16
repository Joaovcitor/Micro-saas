export type CreateProductDTO = {
  name: string;
  description: string;
  price: number;
  stock: number;
  type: string;
  photos: string[];
};

export type UpdateProductDTO = {
  name?: string;
  description?: string;
  price?: number;
  isAvailable?: boolean;
  photos?: string[];
};
