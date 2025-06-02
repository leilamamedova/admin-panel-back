import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getCollection } from '../db/mongodb.js';

// Function to validate login
export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Get the users collection from MongoDB
    const usersCollection = getCollection('authUsers');

    // Find user by username
    const user = await usersCollection.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Generate a JWT token valid for 24 hours with user-specific data
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
    );

    return res.status(200).json({ jwtToken: token }); // Return the token in the response
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
