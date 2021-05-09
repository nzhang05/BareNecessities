/* eslint-disable no-console */
import express from 'express';
import session from 'express-session';
import MessagingResponse from 'twilio/lib/twiml/MessagingResponse';
import * as env from 'env-var';
import messages from './messages/messages.json';
import { buyerMessageTree } from './messages/messageTree';
import { TreeState } from './types/messages';

require('dotenv').config();

// express app
const sessionSecret = env.get('SESSION_SECRET').asString();
const expressServerPort = env.get('PORT').asString();
const app = express();

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
    globalTreeState: TreeState;
  }
}

app.use((req, _res, next) => {
  if (!req.session.globalTreeState) {
    req.session.globalTreeState = {
      location: '',
      product: '',
      storeName: '',
      storeData: [],
      enumeratedVendors: [],
      counter: 0,
      counterDelta: 0,
    };
  }

  next();
});

// express endpoints
app.post('/message', async (req, res) => {
  const body = req.body.Body.trim().toLowerCase();
  const smsCount = req.session.globalTreeState.counter || 0;
  const twiml = new MessagingResponse();
  const messageObject = await buyerMessageTree[smsCount](
    body,
    req.session.globalTreeState,
  );

  req.session.globalTreeState = messageObject.treeState;

  req.session.globalTreeState.counter = smsCount + 1;

  // new case
  if (req.session.globalTreeState.counterDelta === -3) {
    req.session.globalTreeState.counter -= 3;
    req.session.globalTreeState.counterDelta = 0;
  // back case
  } else if (req.session.globalTreeState.counterDelta === -2) {
    req.session.globalTreeState.counter -= 2;
    req.session.globalTreeState.counterDelta = 0;
  // unrecognized or error case
  } else if (req.session.globalTreeState.counterDelta === -1) {
    req.session.globalTreeState.counter -= 1;
    req.session.globalTreeState.counterDelta = 0;
  // exit case
  } else if (messageObject.message === messages.exit) {
    req.session.globalTreeState.counter = 0;
    req.session.globalTreeState.counterDelta = 0;
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
