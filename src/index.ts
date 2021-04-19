/* eslint-disable no-console */
import express from 'express';
import MessagingResponse from 'twilio/lib/twiml/MessagingResponse';
import * as env from 'env-var';
import * as firebaseLib from './firebase';

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

// const storeName = 'KeishaFarm';
// firebaseLib.getStoreProducts(storeName).then((products) => {
//   console.log(`Does KeishaFarm have Bananas? \
//                Products: ${util.inspect(products)}`);
// });

// const product = 'Bananas';
// firebaseLib.getVendorsWithProducts(product).then((vendors) => {
//   console.log(`Who has bananas? KeishaFarm here? ${vendors}`);
// });

// const zip = '02155';
// firebaseLib.getVendorsByZip(zip).then((vendors) => {
//   console.log(`Who is in ${zip} area code? ${vendors}`);
// });

const streetAddress = '99 Medford Ave';
const city = 'Medford';
const state = 'MA';
const country = 'USA';
const zip = '02155';
const testLocation = firebaseLib.createStoreLocation(
  streetAddress, city, state, country, zip,
);

const phoneNumber = '1111111111';
const email = '';
const testContactInfo = firebaseLib.createContactInfo(
  testLocation,
  phoneNumber,
  email,
);

firebaseLib.createStore('KeishaFarm', testContactInfo).then((success) => {
  if (success) {
    console.log('Successful');
  } else {
    console.log('Failed');
  }
});
