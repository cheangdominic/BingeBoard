import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
dotenv.config();

const {
  MONGODB_HOST:     mongodb_host,
  MONGODB_USER:     mongodb_user,
  MONGODB_PASSWORD: mongodb_password,
  MONGODB_DATABASE: mongodb_database,
} = process.env;

const uri = `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/?retryWrites=true&w=majority`;

export let database;
export let userCollection;

export async function connectToDatabase() {
  const client = new MongoClient(uri, {
    useNewUrlParser:    true,
    useUnifiedTopology: true,
  });

  await client.connect();
  database       = client.db(mongodb_database);
  userCollection = database.collection('users');
  console.log('✅ Connected to MongoDB');
}