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

  // 1) add to sender.friendRequestsSent
  await userCollection.updateOne(
    { _id: sender._id },
    { $push: { friendRequestsSent: targetId } }
  );

  // 2) add to target.friendRequestsRecieved
  await userCollection.updateOne(
    { _id: new ObjectId(targetId) },
    { $push: { friendRequestsRecieved: sender._id.toString() } }
  );

  res.json({ success: true });
});

export default router;