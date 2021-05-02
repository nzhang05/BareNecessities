import messages from './messages.json';
// eslint-disable-next-line import/extensions
import { TreeState, MessageObject } from '../types/messages';
import * as firebaseLib from '../firebase';

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
  if (userInput == 'n' || userInput == 'no') {
    newMessage = messages.storeRegisteration
    newTreeState.existingVendor = false;
  } else {
    newMessage = messages.existingVendor;
    newTreeState.existingVendor = true;
  }
  return { message: newMessage, treeState: newTreeState }
};

const existingVendorCheck = async (storeName: string): Promise<boolean> => {
  return firebaseLib.getStoreNames().then(storeNames => {
    return storeName in storeNames;
  });
}

const getVendorDetailsMessage = async (storeName: string): Promise<string> => {
  if (storeName) {
    return firebaseLib.getStoreProducts(storeName).then(products => {
      // \n<productName> <productQuantity><productUnit>\n[]
      // [ProductNameKey, {Price, Quantity, Unit}]
      const productString = Object.entries(products).map(productPair =>
        `${productPair[0]} ${productPair[1].Quantity}${productPair[1].Unit}\n`)
      return `\n${productString}`;
    });
  }
}

const showVendorDetailsOrRegister = (
  userInput: string,
  treeState: TreeState,
): MessageObject => {

  // assuming this data comes in the right order -- TODO: write checks for data 
  // <store name>, <phone>, <email>, <street_address>, <city>

  const newTreeState: TreeState = treeState;
  let responseMessage;

  if (treeState.existingVendor && existingVendorCheck(userInput)) {
    newTreeState.storeName = userInput;
    responseMessage = getVendorDetailsMessage(userInput);
  } else {
    const detailList = userInput.split(',').map((detail) => detail.trim());
    if (detailList.length != 5) {
      // change this to be a message that indicates bad input
      return { message: messages.unrecognizedResponse, treeState }
    } else {
      const storeLocation = firebaseLib.createStoreLocation(detailList[3], detailList[4]);
      const contactInfo = firebaseLib.createContactInfo(storeLocation, detailList[1], detailList[2]);
      firebaseLib.createStore(detailList[0], contactInfo).then(success => {
        if (!success) {
          return { messages: messages.unrecognizedResponse, treeState }
        }
      });
    }
    // parse body to create new store
    // retreive store info
    // FINAL STRING:  "\n<storeName>:\n<productName> <productQuantity><productUnit>\n[]\n<ContactInfo\nPhone: <contactInfoPhoneNumber>\n<contactInfoEmail>\nLocation: <locationStreetAddress>, <locationCity>"
    const vendorDetailsMessage = getVendorDetailsMessage()
    return {
      message: messages.showVendorDetails
        + vendorDetailsMessage
        + messages.showVendorOperations,
      treeState
    }
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
