export interface StoreLocation {
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  zip: string;
}

export interface ContactInfo {
  location: StoreLocation;
  phoneNumber: string;
  email: string;
}

export interface Product {
  price: number;
  quantity: number;
}

export interface Store {
  contactInfo: ContactInfo;
  products?: Product[];
}
