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
    counter: number;
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
    };
  }

  next();
});

// express endpoints
app.post('/message', (req, res) => {
  // only want to remove white space front and back
  const body = req.body.Body.trim().toLowerCase();
  const smsCount = req.session.counter || 0;
  const twiml = new MessagingResponse();
  const messageObject = buyerMessageTree[smsCount](
    body,
    req.session.globalTreeState,
  );

  req.session.globalTreeState = messageObject.treeState;

  req.session.counter = smsCount + 1;

  if (messageObject.message === messages.unrecognizedResponse) {
    req.session.counter -= 1;
  }
  if (body === 'exit') {
    messageObject.message = messages.exit;
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
