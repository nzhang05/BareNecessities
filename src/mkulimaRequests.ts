import axios from 'axios';
import _ from 'lodash';
import { Creator, StoreData } from './types/messages';

const createCreator = (): Creator => ({
  id: 0,
  first_name: '',
  last_name: '',
  phone: '',
  email: '',
  farm_distance: '',
});

const createStoreData = (): StoreData => ({
  id: 0,
  title: '',
  description: '',
  price: 0,
  currency: '',
  locality: '',
  creator: createCreator(),
});

export const getFarmerInfo = () => {};

export const getFarmersWithProduct = (
  product: string,
  locality: string,
) => axios
  .get('https://www.mkulimayoung.com/account/items'
      + `?q=${product}&locality=${locality}`)
  .then((res) => res.data.data.data.map((item: any) => {
    const parsedItem = _.pick(item, Object.keys(createStoreData()));
    return {
      ...parsedItem,
      creator: _.pick(parsedItem.creator, Object.keys(createCreator())),
    };
  }));
