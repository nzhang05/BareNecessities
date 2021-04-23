export interface TreeState {
  location: string;
  userStatus: string;
  storeName: string;
}

export interface MessageObject {
  message: string;
  treeState: TreeState;
}
