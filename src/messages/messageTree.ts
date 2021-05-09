import _ from 'lodash';
import messages from './messages.json';
// eslint-disable-next-line import/extensions
import {
  TreeState, MessageObject, StoreData, ProductDetails, Creator,
} from '../types/messages';
import { getFarmerInfo, getFarmersWithProduct } from '../mkulimaRequests';

const keyWords = {
  search: 'search',
  more: 'more',
  exit: 'exit',
  back: 'back',
  new: 'new',
};

/**
 * Helper functions
 */

const enumerateStringList = (l: string[]) => {
  const nums = [...Array(l.length + 1).keys()]
    .slice(1)
    .map((n) => `${n.toString(10)}.`);
  return _.zip(nums, l)
    .map((p) => p.join(' '));
};

const formatVendorString = (vendors: StoreData[]): string[] => {
  const topVendors = vendors.map((vendor) => {
    const name = vendor.creator.first_name && vendor.creator.last_name
      ? `${vendor.creator.first_name} ${vendor.creator.last_name}`
      : vendor.creator.full_names;
    return `${name.trim()}, ${vendor.locality}`;
  });
  return enumerateStringList(topVendors);
};

const formatVendorDetails = (
  creator: Creator,
  productDetailsList: ProductDetails[],
): string => {
  const { locality } = productDetailsList[0];
  const name = creator.first_name && creator.last_name
    ? `${creator.first_name} ${creator.last_name}`
    : creator.full_names;
  const creatorString = `${name.trim()}\n${locality}\n${creator.phone}\n`
    + `${creator.email}`;
  const productsStringList = productDetailsList.map((product) =>
    `${product.title} ${product.price} ${product.currency}\n`);
  const enumeratedProducts = enumerateStringList(productsStringList);

  return `${creatorString}\n\n${enumeratedProducts.join('')}`;
};

/**
 * Buyer Tree functions
 */

const startMessage = async (
  _userInput: string,
  treeState: TreeState,
): Promise<MessageObject> =>
  ({ message: messages.initResponse, treeState });

const searchMessage = async (
  userInput: string,
  treeState: TreeState,
): Promise<MessageObject> => {
  // const queryList = userInput.split(',').map((w) => w.trim());
  const queryListWithCommand = userInput.split(' ');
  const command = queryListWithCommand[0];
  const queryListWithOutCommand = queryListWithCommand
    .slice(1)
    .map((q) => q.trim())
    .filter((q) => q !== ' ')
    .join(' ')
    .split(',')
    .map((w) => w.trim());

  const queryList = [command].concat(queryListWithOutCommand);

  if (!(queryList[0] in keyWords)) {
    // format error message
    return {
      message: messages.unrecognizedResponse,
      treeState: { ...treeState, counterDelta: -1 },
    };
  }

  switch (queryList[0]) {
    case keyWords.search:
      // eslint-disable-next-line no-constant-condition
      if (queryList.length === 3) {
        const newTreeState: TreeState = treeState;
        const vendors = await getFarmersWithProduct(queryList[1], queryList[2]);
        const topVendors = vendors.slice(0, 5);
        const enumeratedVendors = formatVendorString(topVendors);
        const message = enumeratedVendors.length === 0
          ? messages.searchResultsResponse + messages.noVendorsFound
          : `${messages.searchResultsResponse
          }\n${enumeratedVendors.join('\n')}\n\n${
            messages.searchResultsInstructions}`;

        newTreeState.storeData = topVendors;
        newTreeState.enumeratedVendors = enumeratedVendors;

        return { message, treeState: newTreeState };
      }
      return {
        message: messages.unrecognizedResponse,
        treeState: { ...treeState, counterDelta: -1 },
      };
    case keyWords.exit:
      return { message: messages.exit, treeState };
    default:
      return {
        message: messages.unrecognizedResponse,
        treeState: { ...treeState, counterDelta: -1 },
      };
  }
};

const selectVendorMessage = async (
  userInput: string,
  treeState: TreeState,
): Promise<MessageObject> => {
  const queryList = userInput
    .split(' ')
    .filter((q) => q !== ' ' && q !== '')
    .map((w) => w.trim());

  if (!queryList[0] || !(queryList[0] in keyWords)) {
    // format error message
    return {
      message: messages.unrecognizedResponse,
      treeState: { ...treeState, counterDelta: -1 },
    };
  }

  switch (queryList[0]) {
    case keyWords.more:
      if (queryList.length === 2) {
        const vendorNum: number = Number(queryList[1]);
        if (vendorNum > treeState.storeData.length) {
          return {
            message: messages.unrecognizedResponse,
            treeState: { ...treeState, counterDelta: -1 },
          };
        }
        const productOfVendor: StoreData = treeState.storeData[vendorNum - 1];
        const vendorDetails: ProductDetails[] = await getFarmerInfo(
          productOfVendor.creator.id,
        );
        const selectedVendorResponse = formatVendorDetails(
          productOfVendor.creator,
          vendorDetails,
        );
        return {
          message: `${selectedVendorResponse}\n${messages.resetMessage}`,
          treeState,
        };
      }
      return {
        message: messages.unrecognizedResponse,
        treeState: { ...treeState, counterDelta: -1 },
      };
    case keyWords.new:
      // bring back search step (i.e. delta -= 3)
      return {
        message: messages.initResponse,
        treeState: { ...treeState, counterDelta: -2 },
      };
    case keyWords.back:
      // populate this message with data from treeState
      return {
        message: messages.initResponse,
        treeState: { ...treeState, counterDelta: -2 },
      };
    case keyWords.exit:
      return { message: messages.exit, treeState };
    default:
      return {
        message: messages.unrecognizedResponse,
        treeState: { ...treeState, counterDelta: -1 },
      };
  }
};

const resetMessage = async (
  userInput: string,
  treeState: TreeState,
): Promise<MessageObject> => {
  const queryList = userInput.split(',').map((w) => w.trim());
  if (queryList.length !== 1 || !(queryList[0] in keyWords)) {
    // format error message
    return { message: messages.unrecognizedResponse, treeState };
  }

  switch (queryList[0]) {
    case keyWords.new:
      // bring back search step (i.e. delta -= 3)
      return {
        message: messages.initResponse,
        treeState: { ...treeState, counterDelta: -3 },
      };
    case keyWords.back:
      // bring back step (i.e. delta -= 2)
      return {
        message: `${messages.searchResultsResponse}\n${
          treeState.enumeratedVendors.join('\n')}\n\n${
          messages.searchResultsInstructions}`,
        treeState: { ...treeState, counterDelta: -2 },
      };
    case keyWords.exit:
      return { message: messages.exit, treeState };
    default:
      return {
        message: messages.unrecognizedResponse,
        treeState: { ...treeState, counterDelta: -1 },
      };
  }
};

const exitService = async (
  _userInput: string,
  treeState: TreeState,
): Promise<MessageObject> => ({ message: messages.exit, treeState });

// eslint-disable-next-line import/prefer-default-export
export const buyerMessageTree = [
  startMessage,
  searchMessage,
  selectVendorMessage,
  resetMessage,
  exitService,
];
