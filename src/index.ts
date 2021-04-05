/* eslint-disable no-console */
// import twilio from 'twilio';
import express from 'express';
import session from 'express-session';
import MessagingResponse from 'twilio/lib/twiml/MessagingResponse';
import * as env from 'env-var';
import util from 'util';
import messages from './messages/messages.json';

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

const sessionSecret = env.get('SESSION_SECRET').asString();

if (sessionSecret) {
  app.use(session({ secret: sessionSecret }));
}

declare module 'express-session' {
  export interface Session {
    counter: number;
  }
}

// Create response mapping
const responseMap: Map<string, string> = new Map<string, string>();
responseMap.set('0,Start', messages.initResponse);
responseMap.set('1,1', messages.checkExistingVendor);
responseMap.set('1,ONE', messages.checkExistingVendor);
responseMap.set('1,TWO', messages.isBuyerResponse);
responseMap.set('1,2', messages.isBuyerResponse);
responseMap.set('2,02155', messages.listProductsInstructions);
responseMap.set('3,Tomatoes', messages.listVendorsResponse);
responseMap.set('4,1', messages.choseAndrewFarn);
responseMap.set('5,STOP', messages.stop);

// express endpoints
app.post('/message', (req, res) => {
  console.log(util.inspect(req, { depth: null }));
  const smsCount = req.session.counter || 0;
  let message: string | undefined = '';
  console.log(`Body: ${req.body.Body}`);
  try {
    console.log(`SmsCount: ${smsCount} and reqBody: ${req.body.Body}`);
    const origKey: [number, string] = [smsCount, req.body.Body];
    const key = origKey.join(',');
    message = responseMap.get(key);
    console.log(`after get from map with message ${message}`);
  } catch (err) {
    console.log(err);
    message = messages.unrecognizedResponse;
    req.session.counter -= 1;
  }

  req.session.counter = smsCount + 1;

  const twiml = new MessagingResponse();
  if (message) {
    twiml.message(message);
  }
  res.writeHead(200, {
    'Content-Type': 'text/xml',
  });
  res.end(twiml.toString());
});

// express server
app.listen(expressServerPort, () => {
  console.log(`Listening at http://localhost:${expressServerPort}/`);
});
