export interface TreeState {
  location: string;
  userStatus: string;
  existingVendor: boolean;
  storeName: string;
  stores: string[];
}

export interface MessageObject {
  message: string;
  treeState: TreeState;
}
