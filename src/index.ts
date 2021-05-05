/* eslint-disable no-console */
import express from 'express';
import session from 'express-session';
import MessagingResponse from 'twilio/lib/twiml/MessagingResponse';
import * as env from 'env-var';
import messages from './messages/messages.json';
import { buyerMessageTree, vendorMessageTree } from './messages/messageTree';
import { TreeState } from './types/messages';

require('dotenv').config();

// express app
const buyerRestartSearchLevel = 2;
const sessionSecret = env.get('SESSION_SECRET').asString();
const expressServerPort = env.get('PORT').asString();
const app = express();
let globalTreeState: TreeState = {
  location: '',
  userStatus: 'buyer',
  existingVendor: false,
  storeName: '',
  stores: [],
};

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  }),
);

if (sessionSecret) {
  app.use(
    session({
      secret: sessionSecret,
    }),
  );
}

declare module 'express-session' {
  export interface Session {
    counter: number;
  }
}

// express endpoints
app.post('/message', async (req, res) => {
  // only want to remove white space front and back
  const body = req.body.Body.trim().toLowerCase();
  const smsCount = req.session.counter || 0;
  const twiml = new MessagingResponse();
  const messageObject = globalTreeState.userStatus === 'buyer'
    ? await buyerMessageTree[smsCount](body, globalTreeState)
    : await vendorMessageTree[smsCount](body, globalTreeState);

  globalTreeState = messageObject.treeState;

  req.session.counter = smsCount + 1;

  if (messageObject.message === messages.unrecognizedResponse) {
    req.session.counter -= 1;
  }
  if (messageObject.message === messages.newSearch) {
    req.session.counter = buyerRestartSearchLevel;
  }
  if (body === 'exit' || messageObject.message === messages.exit) {
    if (messageObject.message !== messages.exit) {
      messageObject.message = messages.exit;
    }
    globalTreeState = {
      location: '',
      userStatus: 'buyer',
      existingVendor: false,
      storeName: '',
      stores: [],
    };
    req.session.counter = 0;
  }
  if (messageObject.message) {
    twiml.message(messageObject.message);
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
