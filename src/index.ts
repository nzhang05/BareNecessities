/* eslint-disable no-console */
// const twilio = require('twilio');
import express from 'express';
import bodyParser from 'body-parser';
import MessagingResponse from 'twilio/lib/twiml/MessagingResponse';
import * as env from 'env-var';

require('dotenv').config();

const expressServerPort = env.get('PORT').asString();

console.log(
  'Your environment variable TWILIO_ACCOUNT_SID has the value: ',
  env.get('TWILIO_ACCOUNT_SID').asString(),
);

// express app
const app = express();
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
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

// const numbers = {
//   twilio: `+${process.env.TWILIO_TEST_NUMBER}`,
//   andrew: `+${process.env.ANDREW_CELL_NUMBER}`,
// };

// // create a message -- commented out in order not waste money during testing
// const twilioClient = new twilio(process.env.TWILIO_ACCOUNT_SID,
//   process.env.TWILIO_AUTH_TOKEN);
// twilioClient.messages.create({
//   to: numbers.andrew,
//   from: numbers.twilio,
//   body: 'Hello! Hope you’re having a good day!',
// }, (err, data) => {
//   console.log('ERROR:', { err, data });
// });
