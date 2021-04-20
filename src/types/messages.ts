export interface TreeState {
  location: string;
  userStatus: string;
}

export interface MessageObject {
  message: string;
  treeState: TreeState;
}
