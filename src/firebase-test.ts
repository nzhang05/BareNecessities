/* eslint-disable no-console */
import {
  addProductToStore,
  getStoreProducts,
  deleteProductFromStore,
} from './firebase';
import { Product } from './types/firebase';

/* Test: Add a product to known store in DB
 *  Success: Product is added and listed in stores products data
 *  Failure: Store doesn't add new product, failure message sent
 */
const storeName: string = 'KeishaFarm';
const productName: string = 'cow peas';
const product: Product = {
  price: 13,
  quantity: 20,
  unit: 'kgs',
};

addProductToStore(storeName, productName, product).then((success) => {
  if (success) {
    getStoreProducts(storeName).then((products) => {
      console.log(
        `stores: ${storeName}\n\nproducts:${JSON.stringify(products)}`,
      );
    });
  } else {
    console.log(`Response: adding products to ${storeName} failed\n`);
  }
});

/* Test: Delete a product from known store in DB
 *  Success: Product is deleted and reved from products list
 *  Failure: Store doesn't delete the product, failure message sent
 */
deleteProductFromStore(storeName, productName).then((success) => {
  if (success) {
    getStoreProducts(storeName).then((products) => {
      console.log('Successfully deleted product');
      console.log(`Store: ${storeName}\n\nProduct:${JSON.stringify(products)}`);
    });
  } else {
    console.log(`Response: adding products to ${storeName} failed\n`);
  }
});
