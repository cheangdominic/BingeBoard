/**
 * @file databaseConnection.js
 * @description This module handles the connection to the MongoDB database.
 * It retrieves connection details from environment variables, establishes the connection,
 * and exports the database instance and a specific 'users' collection reference.
 */

// Import the 'dotenv' library to load environment variables from a .env file.
import dotenv from 'dotenv';
// Import the MongoClient class from the 'mongodb' library to interact with MongoDB.
import { MongoClient } from 'mongodb';
// Load environment variables from the .env file into process.env.
dotenv.config();

/**
 * Destructures MongoDB connection details from environment variables.
 * - `mongodb_host`: The host address of the MongoDB cluster.
 * - `mongodb_user`: The username for MongoDB authentication.
 * - `mongodb_password`: The password for MongoDB authentication.
 * - `mongodb_database`: The name of the specific database to connect to within the cluster.
 * @type {{
 *   mongodb_host?: string,
 *   mongodb_user?: string,
 *   mongodb_password?: string,
 *   mongodb_database?: string
 * }}
 */
const {
  MONGODB_HOST:     mongodb_host,
  MONGODB_USER:     mongodb_user,
  MONGODB_PASSWORD: mongodb_password,
  MONGODB_DATABASE: mongodb_database,
} = process.env;

/**
 * The MongoDB connection URI string.
 * Constructed using the environment variables for user, password, and host.
 * Includes `retryWrites=true&w=majority` which are common options for MongoDB Atlas connections.
 * @const {string}
 */
const uri = `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/?retryWrites=true&w=majority`;

/**
 * Exportable variable that will hold the reference to the connected MongoDB database instance.
 * @type {import('mongodb').Db | undefined}
 */
export let database;
/**
 * Exportable variable that will hold the reference to the 'users' collection within the connected database.
 * @type {import('mongodb').Collection | undefined}
 */
export let userCollection;

/**
 * Asynchronously connects to the MongoDB database and initializes the `database` and `userCollection` variables.
 * This function creates a MongoClient, connects to the server, selects the specified database,
 * and gets a reference to the 'users' collection. It also logs a success message upon connection.
 *
 * @async
 * @function connectToDatabase
 * @throws {Error} If the connection to MongoDB fails.
 * @returns {Promise<void>} A promise that resolves when the connection is established.
 */
export async function connectToDatabase() {
  // Create a new MongoClient instance with the connection URI and options.
  // useNewUrlParser and useUnifiedTopology are legacy options that are now defaults or handled differently
  // in newer versions of the MongoDB Node.js driver, but are kept for compatibility if specified.
  const client = new MongoClient(uri, {
    useNewUrlParser:    true, // Uses the new URL parser (legacy, often not needed in v4+ driver).
    useUnifiedTopology: true, // Uses the new Server Discovery and Monitoring engine (legacy, often not needed in v4+ driver).
  });

  // Establish the connection to the MongoDB server.
  await client.connect();
  // Get a reference to the specific database using the name from `mongodb_database` environment variable.
  database       = client.db(mongodb_database);
  // Get a reference to the 'users' collection within that database.
  userCollection = database.collection('users');
  // Log a success message to the console indicating that the connection was successful.
  console.log('✅ Connected to MongoDB');
}