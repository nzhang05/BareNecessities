import _ from 'lodash';
import messages from './messages.json';
import { TreeState, MessageObject } from '../types/messages';
import { ContactInfo } from '../types/firebase';
import * as firebaseLib from '../firebase';

const startMessage = async (
  _userInput: string,
  treeState: TreeState,
): Promise<MessageObject> =>
  ({ message: messages.initResponse, treeState });

const checkBuyerVendor = async (
  userInput: string,
  treeState: TreeState,
): Promise<MessageObject> => {
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

const storeLocation = async (
  userInput: string,
  treeState: TreeState,
): Promise<MessageObject> => {
  const newTreeState: TreeState = treeState;

  newTreeState.location = userInput;
  return {
    message: messages.listProductsInstructions,
    treeState: newTreeState,
  };
};

const getTopVendors = async (products: string[]): Promise<string[]> =>
  Promise.all(
    products.map(((product) =>
      firebaseLib.getVendorsWithProducts(product).then((stores) =>
        ({ product, stores })))),
  ).then((storesByProduct) => {
    const listOfStoreLists = storesByProduct.map((o) => o.stores);
    const allStoreMentions = listOfStoreLists.flat();
    const storeFrequencyMap = _.countBy(allStoreMentions);

    // sort the stores by their frequency
    const mostFrequentStorePairs = Object.entries(storeFrequencyMap)
      .sort((pair1, pair2) => pair1[1] - pair2[1])
      .slice(0, 3);

    // return just the store names, not their frequencies
    return mostFrequentStorePairs.map((p) => p[0]);
  });

const getVendors = async (
  userInput: string,
  treeState: TreeState,
): Promise<MessageObject> => {
  try {
    const products = userInput.split(',');
    const topVendors = await getTopVendors(products);
    const newTreeState: TreeState = treeState;
    const vendorNums = [...Array(topVendors.length + 1).keys()]
      .slice(1)
      .map((n) => `${n.toString(10)}.`);
    const enumeratedVendors = _.zip(vendorNums, topVendors)
      .map((p) => p.join(' '));

    newTreeState.stores = topVendors;

    return {
      message: `${messages.listMatchingVendors}`
        + `${enumeratedVendors.join('\n')}`,
      treeState: newTreeState,
    };
  } catch (error) {
    return { message: messages.unrecognizedResponse, treeState };
  }
};

const formatVendorString = (
  storeName: string,
  products: string[],
  contactInfo: ContactInfo,
): string => {
  const storeProductsStr = `${storeName}:\n${products.join(' \n')}`;
  const contactInfoStr = `Contact Info\nPhone: ${contactInfo.phoneNumber}\n`
    + `Email: ${contactInfo.email}`;
  const locationStr = `Location: ${contactInfo.location.streetAddress}, `
    + `${contactInfo.location.city}, ${contactInfo.location.city}`;

  return `\n ${storeProductsStr} \n\n${contactInfoStr} \n\n${locationStr}\n`;
};

const selectVendor = async (
  userInput: string,
  treeState: TreeState,
): Promise<MessageObject> => {
  if (userInput in ['1', '2', '3']) {
    const store = treeState.stores[Number(userInput) - 1];
    return firebaseLib.getStoreContactInfo(store).then((contactInfo) =>
      firebaseLib.getStoreProducts(store).then((products) => {
        const productNameList = products.keys();
        return {
          message: `${formatVendorString(store, productNameList, contactInfo)
          }\n\n${messages.newSearchOrQuit}`,
          treeState,
        };
      }));
  }
  return { message: messages.unrecognizedResponse, treeState };
};

const searchOrQuit = async (
  userInput: string,
  treeState: TreeState,
): Promise<MessageObject> => {
  if (userInput === 'yes') {
    return { message: messages.newSearch, treeState };
  } if (userInput === 'exit') {
    return { message: messages.exit, treeState };
  }
  return { message: messages.unrecognizedResponse, treeState };
};

const createNewVendor = (
  userInput: string,
  treeState: TreeState,
): MessageObject => {
  let newMessage = '';
  const newTreeState: TreeState = treeState;
  if (userInput === 'n' || userInput === 'no') {
    newMessage = messages.storeRegisteration;
    newTreeState.existingVendor = false;
  } else {
    newMessage = messages.existingVendor;
    newTreeState.existingVendor = true;
  }
  return { message: newMessage, treeState: newTreeState };
};

const existingVendorCheck = async (storeName: string): Promise<boolean> =>
  firebaseLib.getStoreNames().then((storeNames) =>
    storeNames.includes(storeName));

// returns details of store storeName or NONE
const getVendorDetailsMessage = async (storeName: string): Promise<string> =>
  firebaseLib.getStoreProducts(storeName).then((products) => {
    if (products) {
      // [ProductNameKey, {Price, Quantity, Unit}]
      // RETURN SHAPE: \n<productName> <productQuantity><productUnit>\n[]
      const productString = Object.entries(products).map((productPair) => {
        const productName = productPair[0];
        const productDetails: any = productPair[1];

        if (productDetails.Quantity && productDetails.Unit) {
          return `\n${productName} `
            + `${productDetails.Quantity}${productDetails.Unit}\n`;
        }
        return `\nNo store details found for ${storeName}\n`;
      });
      return `\n${productString}`;
    }
    return `\nNo product details available for ${storeName}\n`;
  }).catch((error) => `\nERROR: ${error} when trying to access ${storeName}\n`);

const showVendorDetailsOrRegister = (
  userInput: string,
  treeState: TreeState,
): Promise<MessageObject> => {
  // assuming this data comes in the right order -- TODO: write checks for data
  // <store name>, <phone>, <email>, <street_address>, <city>

  const newTreeState: TreeState = treeState;
  const detailList = userInput.split(',').map((detail) => detail.trim());

  if (detailList.length === 1) {
    const storeName = detailList[0];
    return existingVendorCheck(storeName).then((vendorExists) => {
      if (treeState.existingVendor && vendorExists) {
        newTreeState.storeName = storeName;
        return getVendorDetailsMessage(userInput)
          .then((vendorDetailsMessage) => ({
            message: messages.showVendorDetails
              + vendorDetailsMessage
              + messages.showVendorOperations,
            treeState: newTreeState,
          }));
      }
      return {
        // should be vendor no exist
        message: `Vendor ${detailList} does not exist!`,
        treeState,
      };
    });
  } if (detailList.length === 5) {
    const storeName = detailList[0];
    const storePhone = detailList[1];
    const storeEmail = detailList[2];
    const storeAddress = detailList[3];
    const storeCity = detailList[4];
    const location = firebaseLib.createStoreLocation(
      storeAddress,
      storeCity,
    );
    const contactInfo = firebaseLib.createContactInfo(
      location,
      storePhone,
      storeEmail,
    );

    return firebaseLib.createStore(storeName, contactInfo).then((success) => {
      newTreeState.storeName = storeName;
      return success ? {
        message: `\nStore ${storeName} was created\n${
          messages.showVendorOperations}`,
        treeState: newTreeState,
      } : {
        message: `\nStore ${storeName} couldn't be created\n${
          messages.showVendorOperations}`,
        treeState,
      };
    });
  }

  // wrong number of arguments
  return new Promise((resolve) => resolve({
    message: `ERROR: ${detailList.length} details given.`
      + 'Please give one or five ',
    treeState,
  }));
};

const exitService = async (
  _userInput: string,
  treeState: TreeState,
): Promise<MessageObject> =>
  ({ message: messages.exit, treeState });

export const buyerMessageTree = [
  startMessage,
  checkBuyerVendor,
  storeLocation,
  getVendors,
  selectVendor,
  searchOrQuit,
];

export const vendorMessageTree = [
  startMessage,
  checkBuyerVendor,
  createNewVendor,
  showVendorDetailsOrRegister,
  exitService,
];
