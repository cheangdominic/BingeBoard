import express from 'express';
import { ObjectId } from 'mongodb';
import { userCollection } from './databaseConnection.js';

const router = express.Router();

router.post('/request/:targetId', async (req, res) => {
  const userEmail = req.session.email;
  if (!userEmail) return res.status(401).json({ success: false, message: 'Not logged in' });

  const sender = await userCollection.findOne({ email: userEmail });
  const targetId = req.params.targetId;

  if (!sender || !targetId) {
    return res.status(400).json({ success: false, message: 'Invalid user or target ID' });
  }
  if (sender._id.toString() === targetId) {
    return res.status(400).json({ success: false, message: 'Cannot send friend request to yourself' });
  }

  if (
    sender.friendRequestsSent?.map(id => id.toString()).includes(targetId) ||
    sender.friends?.map(id => id.toString()).includes(targetId)
  ) {
    return res.status(400).json({ success: false, message: 'Already sent or already friends' });
  }

  try {
    await userCollection.updateOne(
      { _id: sender._id },
      { $addToSet: { friendRequestsSent: targetId.toString() } }
    );
    await userCollection.updateOne(
      { _id: new ObjectId(targetId) },
      { $addToSet: { friendRequestsRecieved: sender._id.toString() } }
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Error sending friend request:", error);
    res.status(500).json({ success: false, message: 'Server error sending friend request' });
  }
});

router.post('/accept/:requesterId', async (req, res) => {
  const userEmail = req.session.email;
  if (!userEmail) return res.status(401).json({ success: false, message: 'Not logged in' });

  const receiver = await userCollection.findOne({ email: userEmail });
  const requesterId = req.params.requesterId;

  if (!receiver || !requesterId) {
    return res.status(400).json({ success: false, message: 'Invalid user or requester ID' });
  }
  
  if (!receiver.friendRequestsRecieved?.map(id => id.toString()).includes(requesterId)) {
    return res.status(400).json({ success: false, message: 'No such request' });
  }
  
  try {
    const receiverIdStr = receiver._id.toString();
    const requesterIdObj = new ObjectId(requesterId);

    await userCollection.updateOne(
      { _id: requesterIdObj },
      { 
        $pull: { friendRequestsSent: receiverIdStr },
        $addToSet: { friends: receiverIdStr }
      }
    );
    await userCollection.updateOne(
      { _id: receiver._id },
      { 
        $pull: { friendRequestsRecieved: requesterId },
        $addToSet: { friends: requesterId }
      }
    );
    res.json({ success: true, message: 'Friend request accepted' });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    res.status(500).json({ success: false, message: 'Server error accepting friend request' });
  }
});

router.get('/requests', async (req, res) => {
  const userEmail = req.session.email;
  if (!userEmail) return res.status(401).json({ success: false, message: 'Not logged in' });

  try {
    const user = await userCollection.findOne({ email: userEmail });
    if (!user || !Array.isArray(user.friendRequestsRecieved) || user.friendRequestsRecieved.length === 0) {
      return res.json([]);
    }

    const requestIds = user.friendRequestsRecieved.map(id => {
      try {
        return new ObjectId(id);
      } catch (e) {
        return null; 
      }
    }).filter(id => id !== null);

    if (requestIds.length === 0) {
        return res.json([]);
    }

    const senders = await userCollection.find({
      _id: { $in: requestIds }
    }).project({ _id: 1, username: 1, profilePic: 1 }).toArray();

    res.json(senders);
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    res.status(500).json({ success: false, message: 'Server error fetching friend requests' });
  }
});

router.get('/list/:username', async (req, res) => {
  const { username } = req.params;
  if (!username) {
    return res.status(400).json({ success: false, message: 'Username is required' });
  }

  try {
    const user = await userCollection.findOne({ username: username });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.friends || user.friends.length === 0) {
      return res.json([]);
    }
    
    const friendIds = user.friends.map(id => {
        try {
            return new ObjectId(id);
        } catch(e) {
            return null;
        }
    }).filter(id => id !== null);

    if (friendIds.length === 0) {
        return res.json([]);
    }

    const friendsData = await userCollection.find({
      _id: { $in: friendIds }
    }).project({ _id: 1, username: 1, profilePic: 1 }).toArray();
    
    res.json(friendsData);

  } catch (error) {
    console.error("Error fetching friends list:", error);
    res.status(500).json({ success: false, message: 'Server error fetching friends list' });
  }
});

export default router;