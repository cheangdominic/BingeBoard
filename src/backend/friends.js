/**
 * @file Express router for handling friend-related operations.
 * @module friendRoutes
 * This router manages sending friend requests, accepting friend requests,
 * fetching pending friend requests, and retrieving a user's friend list.
 * It interacts with the MongoDB 'userCollection' for data persistence.
 */

// Import the 'express' library to create router instances
import express from 'express';
// Import ObjectId from 'mongodb' for converting string IDs to MongoDB ObjectId objects
import { ObjectId } from 'mongodb';
// Import the userCollection, which is presumably a MongoDB collection instance for users
import { userCollection } from './databaseConnection.js';

/**
 * Express router to mount friend-related functions on.
 * @type {express.Router}
 */
const router = express.Router();

/**
 * @route POST /request/:targetId
 * @description Sends a friend request from the logged-in user to a target user.
 * The logged-in user's email is retrieved from the session.
 * Updates both the sender's `friendRequestsSent` list and the target's `friendRequestsRecieved` list.
 * @param {string} req.params.targetId - The MongoDB ObjectId (as a string) of the user to whom the friend request is being sent.
 * @param {object} req.session - The session object, expected to contain `email` of the logged-in user.
 * @returns {object} JSON response:
 * - `{ success: true }` on successful request.
 * - `{ success: false, message: string }` on failure, with appropriate HTTP status codes:
 *   - 401: If the user is not logged in.
 *   - 400: For invalid user/target ID, self-friending, or if request already sent/is friends.
 *   - 500: For server errors during database operations.
 * @async
 */
router.post('/request/:targetId', async (req, res) => {
  // Retrieve the logged-in user's email from the session
  const userEmail = req.session.email;
  // If no email in session, user is not logged in; return 401 Unauthorized
  if (!userEmail) return res.status(401).json({ success: false, message: 'Not logged in' });

  // Find the sender (logged-in user) in the database using their email
  const sender = await userCollection.findOne({ email: userEmail });
  // Get the target user's ID from the request parameters
  const targetId = req.params.targetId;

  // Validate that both sender and targetId are present
  if (!sender || !targetId) {
    return res.status(400).json({ success: false, message: 'Invalid user or target ID' });
  }
  // Prevent a user from sending a friend request to themselves
  if (sender._id.toString() === targetId) {
    return res.status(400).json({ success: false, message: 'Cannot send friend request to yourself' });
  }

  // Check if a request has already been sent to this target or if they are already friends
  // Optional chaining `?.` is used in case `friendRequestsSent` or `friends` array does not exist
  if (
    sender.friendRequestsSent?.map(id => id.toString()).includes(targetId) ||
    sender.friends?.map(id => id.toString()).includes(targetId)
  ) {
    return res.status(400).json({ success: false, message: 'Already sent or already friends' });
  }

  try {
    // Add the targetId to the sender's `friendRequestsSent` array.
    // `$addToSet` ensures the ID is added only if it's not already present.
    await userCollection.updateOne(
      { _id: sender._id },
      { $addToSet: { friendRequestsSent: targetId.toString() } }
    );
    // Add the sender's ID to the target user's `friendRequestsRecieved` array.
    // The targetId needs to be converted to an ObjectId for the query.
    await userCollection.updateOne(
      { _id: new ObjectId(targetId) },
      { $addToSet: { friendRequestsRecieved: sender._id.toString() } }
    );
    // Respond with success
    res.json({ success: true });
  } catch (error) {
    // Log the error and respond with a 500 Internal Server Error
    console.error("Error sending friend request:", error);
    res.status(500).json({ success: false, message: 'Server error sending friend request' });
  }
});

/**
 * @route POST /accept/:requesterId
 * @description Accepts a friend request from a specified requester.
 * The logged-in user (receiver) accepts the request.
 * Updates involve removing the request from pending lists and adding each user to the other's `friends` list.
 * @param {string} req.params.requesterId - The MongoDB ObjectId (as a string) of the user who sent the friend request.
 * @param {object} req.session - The session object, expected to contain `email` of the logged-in user (the receiver).
 * @returns {object} JSON response:
 * - `{ success: true, message: 'Friend request accepted' }` on successful acceptance.
 * - `{ success: false, message: string }` on failure, with appropriate HTTP status codes:
 *   - 401: If the user is not logged in.
 *   - 400: For invalid user/requester ID, or if no such request exists.
 *   - 500: For server errors during database operations.
 * @async
 */
router.post('/accept/:requesterId', async (req, res) => {
  // Retrieve the logged-in user's email from the session
  const userEmail = req.session.email;
  // If no email in session, user is not logged in; return 401 Unauthorized
  if (!userEmail) return res.status(401).json({ success: false, message: 'Not logged in' });

  // Find the receiver (logged-in user) in the database
  const receiver = await userCollection.findOne({ email: userEmail });
  // Get the requester's ID from the request parameters
  const requesterId = req.params.requesterId;

  // Validate that both receiver and requesterId are present
  if (!receiver || !requesterId) {
    return res.status(400).json({ success: false, message: 'Invalid user or requester ID' });
  }
  
  // Check if the receiver actually has a pending request from this requesterId
  if (!receiver.friendRequestsRecieved?.map(id => id.toString()).includes(requesterId)) {
    return res.status(400).json({ success: false, message: 'No such request' });
  }
  
  try {
    // Convert receiver's ID to string and requester's ID to ObjectId for database operations
    const receiverIdStr = receiver._id.toString();
    const requesterIdObj = new ObjectId(requesterId);

    // Update the requester's document:
    // - `$pull`: Remove the receiver's ID from `friendRequestsSent`.
    // - `$addToSet`: Add the receiver's ID to `friends`.
    await userCollection.updateOne(
      { _id: requesterIdObj },
      { 
        $pull: { friendRequestsSent: receiverIdStr },
        $addToSet: { friends: receiverIdStr }
      }
    );
    // Update the receiver's document:
    // - `$pull`: Remove the requester's ID from `friendRequestsRecieved`.
    // - `$addToSet`: Add the requester's ID to `friends`.
    await userCollection.updateOne(
      { _id: receiver._id },
      { 
        $pull: { friendRequestsRecieved: requesterId },
        $addToSet: { friends: requesterId }
      }
    );
    // Respond with success
    res.json({ success: true, message: 'Friend request accepted' });
  } catch (error) {
    // Log the error and respond with a 500 Internal Server Error
    console.error("Error accepting friend request:", error);
    res.status(500).json({ success: false, message: 'Server error accepting friend request' });
  }
});

/**
 * @route GET /requests
 * @description Fetches all pending friend requests received by the logged-in user.
 * Returns an array of user objects (sender details) for each pending request.
 * @param {object} req.session - The session object, expected to contain `email` of the logged-in user.
 * @returns {Array<object>|object} JSON response:
 * - An array of sender objects (each with `_id`, `username`, `profilePic`) or an empty array `[]` if no requests.
 * - `{ success: false, message: string }` on failure, with appropriate HTTP status codes:
 *   - 401: If the user is not logged in.
 *   - 500: For server errors during database operations.
 * @async
 */
router.get('/requests', async (req, res) => {
  // Retrieve the logged-in user's email from the session
  const userEmail = req.session.email;
  // If no email in session, user is not logged in; return 401 Unauthorized
  if (!userEmail) return res.status(401).json({ success: false, message: 'Not logged in' });

  try {
    // Find the logged-in user in the database
    const user = await userCollection.findOne({ email: userEmail });
    // If user not found, or no friend requests received, or the list is empty, return an empty array
    if (!user || !Array.isArray(user.friendRequestsRecieved) || user.friendRequestsRecieved.length === 0) {
      return res.json([]);
    }

    // Map the string IDs from `friendRequestsRecieved` to MongoDB ObjectId objects.
    // Includes a try-catch to handle potential errors if an ID is not a valid ObjectId string.
    const requestIds = user.friendRequestsRecieved.map(id => {
      try {
        return new ObjectId(id);
      } catch (e) {
        // If an ID is invalid, log it (optional) and return null to filter out later
        console.warn(`Invalid ObjectId string in friendRequestsRecieved for user ${userEmail}: ${id}`);
        return null; 
      }
    }).filter(id => id !== null); // Filter out any nulls resulting from invalid IDs

    // If, after filtering, there are no valid request IDs, return an empty array
    if (requestIds.length === 0) {
        return res.json([]);
    }

    // Fetch the details of the users who sent the requests.
    // `$in` operator matches documents where `_id` is in the `requestIds` array.
    // `project` limits the fields returned for each sender.
    const senders = await userCollection.find({
      _id: { $in: requestIds }
    }).project({ _id: 1, username: 1, profilePic: 1 }).toArray();

    // Respond with the array of sender details
    res.json(senders);
  } catch (error) {
    // Log the error and respond with a 500 Internal Server Error
    console.error("Error fetching friend requests:", error);
    res.status(500).json({ success: false, message: 'Server error fetching friend requests' });
  }
});

/**
 * @route GET /list/:username
 * @description Fetches the list of friends for a specified username.
 * Returns an array of user objects (friend details).
 * @param {string} req.params.username - The username of the user whose friends list is being requested.
 * @returns {Array<object>|object} JSON response:
 * - An array of friend objects (each with `_id`, `username`, `profilePic`) or an empty array `[]` if no friends or user not found.
 * - `{ success: false, message: string }` on failure, with appropriate HTTP status codes:
 *   - 400: If username parameter is missing.
 *   - 404: If the user with the given username is not found.
 *   - 500: For server errors during database operations.
 * @async
 */
router.get('/list/:username', async (req, res) => {
  // Destructure username from request parameters
  const { username } = req.params;
  // Validate that username is provided
  if (!username) {
    return res.status(400).json({ success: false, message: 'Username is required' });
  }

  try {
    // Find the user in the database by their username
    const user = await userCollection.findOne({ username: username });
    // If user is not found, return 404 Not Found
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // If the user has no friends array or it's empty, return an empty array
    if (!user.friends || user.friends.length === 0) {
      return res.json([]);
    }
    
    // Map the string IDs from the user's `friends` array to MongoDB ObjectId objects.
    // Includes a try-catch for robust ObjectId conversion.
    const friendIds = user.friends.map(id => {
        try {
            return new ObjectId(id);
        } catch(e) {
            // If an ID is invalid, log it (optional) and return null
            console.warn(`Invalid ObjectId string in friends list for user ${username}: ${id}`);
            return null;
        }
    }).filter(id => id !== null); // Filter out any nulls from invalid IDs

    // If, after filtering, there are no valid friend IDs, return an empty array
    if (friendIds.length === 0) {
        return res.json([]);
    }

    // Fetch the details of the user's friends.
    // `$in` operator matches documents where `_id` is in the `friendIds` array.
    // `project` limits the fields returned for each friend.
    const friendsData = await userCollection.find({
      _id: { $in: friendIds }
    }).project({ _id: 1, username: 1, profilePic: 1 }).toArray();
    
    // Respond with the array of friend details
    res.json(friendsData);

  } catch (error) {
    // Log the error and respond with a 500 Internal Server Error
    console.error("Error fetching friends list:", error);
    res.status(500).json({ success: false, message: 'Server error fetching friends list' });
  }
});

/**
 * Exports the configured Express router for use in the main application.
 * @default router
 */
export default router;