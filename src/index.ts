/* eslint-disable no-console */
import express from 'express';
import MessagingResponse from 'twilio/lib/twiml/MessagingResponse';
import * as env from 'env-var';
import util from 'util';
import {
  getStoreProducts,
  getVendorsWithProducts,
  getVendorsByZip,
} from './firebase';

require('dotenv').config();

const expressServerPort = env.get('PORT').asString();

console.log(
  'Your environment variable TWILIO_ACCOUNT_SID has the value: ',
  env.get('TWILIO_ACCOUNT_SID').asString(),
);

// express app
const app = express();
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  }),
);

// express endpoints
app.post('/message', (_req, res) => {
  const resp = new MessagingResponse();
  resp.message('Thanks for subscribing!');
  res.writeHead(200, {
    'Content-Type': 'text/xml',
  });
  res.end(resp.toString());
});

// express server
app.listen(expressServerPort, () => {
  console.log(`Listening at http://localhost:${expressServerPort}/`);
});

const storeName = 'KeishaFarm';
getStoreProducts(storeName).then((products) => {
  console.log(`Does KeishaFarm have Bananas? \
               Products: ${util.inspect(products)}`);
});

const product = 'Bananas';
getVendorsWithProducts(product).then((vendors) => {
  console.log(`Who has bananas? KeishaFarm here? ${vendors}`);
});

const zip = '02155';
getVendorsByZip(zip).then((vendors) => {
  console.log(`Who is in ${zip} area code? ${vendors}`);
});
