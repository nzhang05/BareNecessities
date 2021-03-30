/* eslint-disable no-console */
<<<<<<< HEAD
import twilio from 'twilio';
=======
>>>>>>> ec61ac7... uncommented twilio references
import express from 'express';
import MessagingResponse from 'twilio/lib/twiml/MessagingResponse';
import * as env from 'env-var';
<<<<<<< HEAD
import messages from './messages/messages.json';
=======
import Twilio from 'twilio';
>>>>>>> ec61ac7... uncommented twilio references

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

const numbers = {
  twilio: `+${process.env.TWILIO_TEST_NUMBER}`,
  andrew: `+${process.env.ANDREW_CELL_NUMBER}`,
  magic: '+15005550006',
};

// create a message -- commented out in order not waste money during testing
// eslint-disable-next-line new-cap
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);
twilioClient.messages.create(
  {
    to: numbers.andrew,
    from: numbers.twilio,
    body: messages.greeting,
  },
  (err, data) => {
    console.log('ERROR:', { err, data });
  },
);
