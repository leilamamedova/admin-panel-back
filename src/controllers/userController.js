import { getCollection } from '../db/mongodb.js';

// Controller to get users
export const getUsers = async (req, res) => {
  const { page = 1, limit = 10, phoneNumber, name, email } = req.query;

  try {
    const collection = getCollection('users');
    const query = {};

    // Handle search filters
    if (phoneNumber && phoneNumber.trim() !== '') {
      query.phoneNumber = phoneNumber;
    }

    if (name && name.trim() !== '') {
      query.name = new RegExp(name, 'i'); // Case-insensitive search for name
    }

    if (email && email.trim() !== '') {
      query.email = new RegExp(`^${email.trim()}$`, 'i'); // Exact match, case-insensitive
    }

    // Fetch the users
    const users = await collection
      .find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .toArray();

    const total = await collection.countDocuments(query);

    // Return the result
    res.json({
      count: total,
      response: {
        items: users,
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Controller to toggle user activation
export const toggleUserActivation = async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  try {
    const collection = getCollection('users');

    // Assuming your data uses the field 'id' instead of '_id'
    const result = await collection.updateOne(
      { id: parseInt(id) }, // Use 'id' field and convert to integer
      { $set: { isActive } },
    );

    if (result.modifiedCount > 0) {
      res.json(true);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating user activation:', error);
    res.status(500).json({ error: 'Failed to update user activation' });
  }
};
