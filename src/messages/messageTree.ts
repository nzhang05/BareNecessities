import messages from './messages.json';
// eslint-disable-next-line import/extensions
import { TreeState, MessageObject } from '../types/messages';

const startMessage = (_userInput: string, treeState: TreeState): MessageObject =>
  ({ message: messages.initResponse, treeState });

const checkBuyerVendor = (
  userInput: string,
  treeState: TreeState,
): MessageObject => {
  const newTreeState: TreeState = treeState;
  if (userInput === '1' || userInput === 'one') {
    newTreeState.userStatus = 'buyer';
    return { message: messages.isBuyerResponse, treeState: newTreeState };
  }
  if (userInput === '2' || userInput === 'two') {
    newTreeState.userStatus = 'vendor';
    return { message: messages.checkExistingVendor, treeState: newTreeState };
  }
  return { message: messages.unrecognizedResponse, treeState: newTreeState };
};

const storeLocation = (
  userInput: string,
  treeState: TreeState,
): MessageObject => {
  const newTreeState: TreeState = treeState;
  newTreeState.location = userInput;
  return {
    message: messages.listProductsInstructions,
    treeState: newTreeState,
  };
};

const getProducts = (
  _userInput: string,
  treeState: TreeState,
): MessageObject =>
// Make firebase call to store products list
  ({ message: messages.listMatchingVendors, treeState });

const selectVendor = (
  _userInput: string,
  treeState: TreeState,
): MessageObject => ({ message: messages.choseAndrewFarm, treeState });

const searchOrQuit = (
  _userInput: string,
  treeState: TreeState,
): MessageObject => ({ message: messages.newSearchOrQuit, treeState });

const exitService = (
  _userInput: string,
  treeState: TreeState,
): MessageObject => ({ message: messages.exit, treeState });

const createNewVendor = (
  userInput: string,
  treeState: TreeState,
): MessageObject => { 

  let newMessage = '';
  const newTreeState: TreeState = treeState;
  if (userInput == 'N' || userInput == 'no') {
    newMessage = messages.storeRegisteration
    newTreeState.existingVendor = false;
  }
  newMessage = messages.existingVendor;
  newTreeState.existingVendor = true;
  return {message: newMessage, treeState: newTreeState}
};

const showVendorDetailsAndPrompt = (
  userInput: string,
  treeState: TreeState,

): MessageObject => {

  const newTreeState: TreeState = treeState;

  if (treeState.existingVendor){
    newTreeState.storeName = userInput;
  }
  // parse body to create new store
  // retreive store info
  return { message: messages.showVendorDetails + messages.choseAndrewFarm + messages.showVendorOperations, treeState }
};

export const buyerMessageTree = [
  startMessage,
  checkBuyerVendor,
  storeLocation,
  getProducts,
  selectVendor,
  searchOrQuit,
  exitService,
];

export const vendorMessageTree = [
  startMessage,
  checkBuyerVendor,
  createNewVendor,
  showVendorDetailsAndPrompt,
  exitService
];
