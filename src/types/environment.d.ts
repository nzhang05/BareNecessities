/* eslint-disable no-unused-vars */
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      PORT?: string;
      PWD: string;
      TWILIO_ACCOUNT_SID: string;
      TWILIO_AUTH_TOKEN: string;
      TWILIO_TEST_NUMBER: string;
      ANDREW_CELL_NUMBER: string;
      NOAH_CELL_NUMER: string;
      TWILIO_TEST_ACCOUNT_SID: string;
      TWILIO_TEST_AUTH_TOKEN: string;
      
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
