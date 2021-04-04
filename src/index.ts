/* eslint-disable no-console */
import twilio from 'twilio';
import express from 'express';
import MessagingResponse from 'twilio/lib/twiml/MessagingResponse';
import * as env from 'env-var';
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

// express endpoints
app.post('/message', (_req, res) => {
  const twiml = new MessagingResponse();

  if (_req.body.Body === 'Start') {
    twiml.message(messages.initResponse);
  } else if (_req.body.Body === '2' || _req.body.Body === 'TWO') {
    twiml.message(
      'Text your zipcode so that we can select vendors \
                  based on your location or STOP if \
                  you would like to quit using the service.',
    );
  } else {
    twiml.message(
      'No Body param match, Twilio sends this in the request to your server.',
    );
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

const numbers = {
  twilio: `+${process.env.TWILIO_TEST_NUMBER}`,
  andrew: `+${process.env.ANDREW_CELL_NUMBER}`,
  magic: '+15005550006',
  keisha: `+${process.env.KEISHA_CELL_NUMBER}`,
};

// create a message -- commented out in order not waste money during testing
// eslint-disable-next-line new-cap
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);
twilioClient.messages.create(
  {
    to: numbers.keisha,
    from: numbers.twilio,
    body: messages.initResponse,
  },
  (err, data) => {
    console.log('ERROR:', { err, data });
  },
);
