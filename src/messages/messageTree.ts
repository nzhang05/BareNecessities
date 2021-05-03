import messages from './messages.json';
// eslint-disable-next-line import/extensions
import { TreeState, MessageObject } from '../types/messages';
import { Product } from '../types/firebase';
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
  return firebaseLib.getStoreProducts(storeName).then(products => {
    // [ProductNameKey, {Price, Quantity, Unit}]
    const productString = Object.entries(products).map(productPair => {
      const productName = productPair[0];
      const productDetails: any = productPair[1];
      console.log(productString);
      if (productDetails.Quantity && productDetails.Unit) {
        // RETURN SHAPE: \n<productName> <productQuantity><productUnit>\n[]
        return `${productName} ${productDetails.Quantity}${productDetails.Unit}\n`;
      } else {
        return `ERROR: No store details found for ${storeName}`;
      }
    });
    return `\n${productString}`;
  });
}

const showVendorDetailsOrRegister = (
  userInput: string,
  treeState: TreeState,
): Promise<MessageObject> => {

  // assuming this data comes in the right order -- TODO: write checks for data 
  // <store name>, <phone>, <email>, <street_address>, <city>

  const newTreeState: TreeState = treeState;
  let responseMessage;

  return existingVendorCheck(userInput).then(vendorExists => {
    if (treeState.existingVendor && vendorExists) {
      newTreeState.storeName = userInput;
      return getVendorDetailsMessage(userInput).then(vendorDetailsMessage => {
        return {
          message: messages.showVendorDetails
            + vendorDetailsMessage
            + messages.showVendorOperations,
          treeState: newTreeState
        }
      });
    } else {
      const detailList = userInput.split(',').map((detail) => detail.trim());
      
      if (detailList.length != 5) {
        return { message: messages.unrecognizedResponse, treeState } // change this to be a message that indicates bad input
      } else {
        const storeName = detailList[0];
        const storePhone = detailList[1];
        const storeEmail = detailList[2];
        const storeAddress = detailList[3];
        const storeCity = detailList[4];
        const storeLocation = firebaseLib.createStoreLocation(storeAddress, storeCity);
        const contactInfo = firebaseLib.createContactInfo(storeLocation, storePhone, storeEmail);

        return firebaseLib.createStore(storeName, contactInfo).then(success => {
          if (!success) {
            return { message: messages.unrecognizedResponse, treeState }
          }
          return getVendorDetailsMessage(userInput).then(vendorDetailsMessage => {
            return {
                message: messages.showVendorDetails
                + vendorDetailsMessage
                + messages.showVendorOperations,
              treeState: newTreeState
            }
          });
        });
      }
    }
  });
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
    showVendorDetailsOrRegister,
    exitService
  ];
