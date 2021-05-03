export interface StoreLocation {
  streetAddress: string;
  city: string;
}

export interface ContactInfo {
  location: StoreLocation;
  phoneNumber: string;
  email: string;
}

export interface Product {
  price: number;
  quantity: number;
  unit?: string;
}

export interface Store {
  contactInfo: ContactInfo;
  products?: Product[];
}
