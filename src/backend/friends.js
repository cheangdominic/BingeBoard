import express from 'express';
import { ObjectId } from 'mongodb';
import { userCollection } from './databaseConnection.js';

const router = express.Router();

router.post('/request/:targetId', async (req, res) => {
  const userEmail = req.session.email;
  if (!userEmail) return res.status(401).json({ success: false, message: 'Not logged in' });

  const sender   = await userCollection.findOne({ email: userEmail });
  const targetId = req.params.targetId;
  if (!sender || sender._id.toString() === targetId) {
    return res.status(400).json({ success: false, message: 'Invalid request' });
  }

  // prevent duplicates
  if (
    sender.friendRequestsSent.includes(targetId) ||
    sender.friends.includes(targetId)
  ) {
    return res.status(400).json({ success: false, message: 'Already sent or already friends' });
  }

  // add to sender.friendRequestsSent
  await userCollection.updateOne(
    { _id: sender._id },
    { $push: { friendRequestsSent: targetId } }
  );

  // add to target.friendRequestsRecieved
  await userCollection.updateOne(
    { _id: new ObjectId(targetId) },
    { $push: { friendRequestsRecieved: sender._id.toString() } }
  );

  res.json({ success: true });
});

router.post('/accept/:requesterId', async (req, res) => {
  const userEmail = req.session.email;
  if (!userEmail) return res.status(401).json({ success: false, message: 'Not logged in' });

  const receiver = await userCollection.findOne({ email: userEmail });
  const requesterId = req.params.requesterId;

  if (!receiver || !receiver.friendRequestsRecieved.includes(requesterId)) {
    return res.status(400).json({ success: false, message: 'No such request' });
  }

  // Remove users from friendRequestsSent/Recieved
  await userCollection.updateOne(
    { _id: new ObjectId(requesterId) },
    { $pull: { friendRequestsSent: receiver._id.toString() }, $push: { friends: receiver._id.toString() } }
  );

  await userCollection.updateOne(
    { _id: receiver._id },
    { $pull: { friendRequestsRecieved: requesterId }, $push: { friends: requesterId } }
  );

  res.json({ success: true, message: 'Friend request accepted' });
});

router.get('/requests', async (req, res) => {
  const userEmail = req.session.email;
  if (!userEmail) return res.status(401).json({ success: false, message: 'Not logged in' });

  const user = await userCollection.findOne({ email: userEmail });
  if (!user || !Array.isArray(user.friendRequestsRecieved)) {
    return res.json([]);
  }

  const requestIds = user.friendRequestsRecieved.map(id => new ObjectId(id));

  const senders = await userCollection.find({
    _id: { $in: requestIds }
  }).project({ _id: 1, username: 1, profilePic: 1 }).toArray();

  res.json(senders);
});

export default router;