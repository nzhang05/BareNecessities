export interface Creator {
  id: number;
  // eslint-disable-next-line camelcase
  first_name: string;
  // eslint-disable-next-line camelcase
  last_name: string;
  // eslint-disable-next-line camelcase
  full_names: string;
  phone: string;
  email: string;
  // eslint-disable-next-line camelcase
  farm_distance: string;
}

export interface ProductDetails {
  id: number;
  title: string;
  description: string;
  price: number;
  currency: string;
  locality: string;
}

export type StoreData = ProductDetails & { creator: Creator }

export interface TreeState {
  location: string;
  product: string;
  storeName: string;
  storeData: StoreData[];
  enumeratedVendors: string[];
  counter: number;
  counterDelta: 0 | -1 | -2 | -3;
}

export interface MessageObject {
  message: string;
  treeState: TreeState;
}
