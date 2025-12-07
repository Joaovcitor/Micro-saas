export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  stripeCustomerId: string;
}

export interface CreateStoreUserDTO extends CreateUserDTO {
  storeId: string;
}

export interface CreateStoreDTO {
  name: string;
  subDomain: string;
}

export interface UpdateUserStoreDTO {
  storeId: string;
}
export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}
