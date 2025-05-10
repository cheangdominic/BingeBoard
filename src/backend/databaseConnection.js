import dotenv from 'dotenv';
dotenv.config();

import { MongoClient } from 'mongodb';

const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;

const atlasURI = `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/?retryWrites=true`;

const database = new MongoClient(atlasURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

database.connect()
  .then(() => {
    console.log('Connected to the database');
  })
  .catch((error) => {
    console.log('Not connected to the database', error);
  });

export { database };