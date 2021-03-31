import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import * as admin from 'firebase-admin';
import * as env from 'env-var';
// eslint-disable-next-line no-multi-str
import serviceAccount from '\
./bare-necessities-60939-firebase-adminsdk-1vgof-20badddf68.json';

// firebase client
const firebaseConfig = {
  apiKey: `${env.get('FIREBASE_API_KEY').asString()}`,
  authDomain: `${env.get('FIREBASE_PROJECT_ID').asString()}.firebaseapp.com`,
  databaseURL: `${env.get('FIREBASE_URL').asString()}`,
  projectId: `${env.get('FIREBASE_PROJECT_ID').asString()}`,
  storageBucket: `${env.get('FIREBASE_PROJECT_ID').asString()}.appspot.com`,
  messagingSenderId: env.get('FIREBASE_MESSAGING_SENDER').asString(),
  appId: env.get('FIREBASE_APP_ID').asString(),
};

firebase.initializeApp(firebaseConfig);

const params = {
  type: serviceAccount.type,
  projectId: serviceAccount.project_id,
  privateKeyId: serviceAccount.private_key_id,
  privateKey: serviceAccount.private_key,
  clientEmail: serviceAccount.client_email,
  clientId: serviceAccount.client_id,
  authUri: serviceAccount.auth_uri,
  tokenUri: serviceAccount.token_uri,
  authProviderX509CertUrl: serviceAccount.auth_provider_x509_cert_url,
  clientC509CertUrl: serviceAccount.client_x509_cert_url,
};

admin.initializeApp({
  credential: admin.credential.cert(params),
  databaseURL: 'https://bare-necessities-60939-default-rtdb.firebaseio.com',
});

const adminDb = admin.database();

export const authenticateUser = async (email: string, password: string) => {
  let error = true;
  const success = await firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then(() => {
      error = true;
      return true;
    })
    .catch(() => {
      error = false;
      return false;
    });
  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);
  return error && success;
};

export const signOutUser = () => firebase.auth().signOut();

export const getStoreProducts = async (storeName: string) =>
  adminDb
    .ref(`Stores/${storeName}/Products`)
    .once('value')
    .then((snapshot) => snapshot.val());
