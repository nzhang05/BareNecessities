/* eslint-disable no-console */
// import twilio from 'twilio';
import express from 'express';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import MessagingResponse from 'twilio/lib/twiml/MessagingResponse';
import * as env from 'env-var';
// import messages from './messages/messages.json';

require('dotenv').config();

const expressServerPort = env.get('PORT').asString();
const firebaseConfig = {
  apiKey: `${env.get('FIREBASE_API_KEY').asString()}`,
  authDomain: `${env.get('FIREBASE_PROJECT_ID').asString()}.firebaseapp.com`,
  databaseURL: `${env.get('FIREBASE_URL').asString()}`,
  projectId: `${env.get('FIREBASE_PROJECT_ID').asString()}`,
  storageBucket: `${env.get('FIREBASE_PROJECT_ID').asString()}.appspot.com`,
  messagingSenderId: env.get('FIREBASE_MESSAGING_SENDER').asString(),
  appId: env.get('FIREBASE_APP_ID').asString(),
};

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

// const numbers = {
//   twilio: `+${process.env.TWILIO_TEST_NUMBER}`,
//   andrew: `+${process.env.ANDREW_CELL_NUMBER}`,
// };

// create a message -- commented out in order not waste money during testing
// eslint-disable-next-line new-cap
// const twilioClient = twilio(
//   process.env.TWILIO_ACCOUNT_SID,
//   process.env.TWILIO_AUTH_TOKEN,
// );
// twilioClient.messages.create(
//   {
//     to: numbers.andrew,
//     from: numbers.twilio,
//     body: messages.greeting,
//   },
//   (err, data) => {
//     console.log('ERROR:', { err, data });
//   },
// );

// firebase client
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const authenticateUser = async (email: string, password: string) => {
  let error = true;
  const success = await firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then(() => {
      error = true;
      return true;
    })
    .catch((err) => {
      console.log(err);
      error = false;
      return false;
    });
  // firebase.auth()
  //   .setPersistence(firebase.auth.Auth.Persistence.SESSION);
  return error && success;
};

const signOutUser = () => {
  firebase.auth().signOut();
};

const email = env.get('ANDREW_GMAIL').asString();
const password = env.get('ANDREW_PASSWORD').asString();

if (email && password) {
  authenticateUser(email, password)
    .then(() => {
      db.ref('Numbers')
        .once('value')
        .then((snapshot) => {
          const nums = snapshot.val();
          console.log(nums);
        });
      signOutUser();
    })
    .catch((err) => {
      console.log(err);
    });
}
