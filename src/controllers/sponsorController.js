import { getCollection } from '../db/mongodb.js';

// Controller to get all sponsors
export const getSponsors = async (req, res) => {
  try {
    const collection = getCollection('sponsors'); // Get the 'sponsors' collection from MongoDB

    // Fetch sponsors from the collection
    const sponsors = await collection.find().toArray();

    // Return the sponsors in response
    res.json({
      response: {
        items: sponsors,
      },
    });
  } catch (error) {
    console.error('Error fetching sponsors:', error);
    res.status(500).json({ error: 'Failed to fetch sponsors' });
  }
};
