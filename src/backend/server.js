import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import bcrypt from 'bcrypt';
import Joi from 'joi';
import bodyParser from 'body-parser';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { MongoClient } from 'mongodb';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

const saltRounds = 12;

app.use(bodyParser.json());
app.use(cors());

// MongoDB configuration
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
const node_session_secret = process.env.NODE_SESSION_SECRET;

// Initialize database connection
const atlasURI = `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/?retryWrites=true`;
const client = new MongoClient(atlasURI);

let database;
let userCollection;

async function connectToDatabase() {
  try {
    await client.connect();
    database = client.db(mongodb_database);
    userCollection = database.collection('users');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Session store configuration
const mongoStore = MongoStore.create({
  mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/sessions`,
  crypto: {
    secret: mongodb_session_secret
  }
});

app.use(session({
  secret: node_session_secret,
  store: mongoStore,
  saveUninitialized: false,
  resave: true
}));

app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: false }));

app.post('/api/signup', async (req, res) => {
  if (!userCollection) {
    return res.status(500).json({ success: false, message: 'Database not connected' });
  }

  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ 
      success: false,
      message: 'All fields are required' 
    });
  }

  const schema = Joi.object({
    username: Joi.string().alphanum().max(20).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(20).required()
  });

  const validationResult = schema.validate({ username, email, password });
  if (validationResult.error != null) {
    console.log(validationResult.error);
    return res.redirect("/signup");
  }

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await userCollection.insertOne({
      username: username,
      email: email,
      password: hashedPassword
    });
    console.log("Inserted user");
    return res.json({ success: true });
  } catch (error) {
    console.error("Error inserting user:", error);
    return res.status(500).json({ success: false, message: 'Error creating user' });
  }
});

// Start server after database connection
connectToDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});