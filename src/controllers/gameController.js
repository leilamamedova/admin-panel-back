import { getCollection } from '../db/mongodb.js';

// Get games with optional filters
export const getGames = async (req, res) => {
  const { page = 1, limit = 10, startDate, endDate, isCurrent } = req.query;

  const query = {};

  if (startDate) query.startDate = { $gte: new Date(startDate) };
  if (endDate) query.endDate = { $lte: new Date(endDate) };
  if (isCurrent && isCurrent !== 'false') {
    query.isCurrentWeek = Boolean(isCurrent);
  }

  try {
    const collection = getCollection('games');
    const games = await collection
      .find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .toArray();

    const total = await collection.countDocuments(query);

    res.json({
      count: total,
      response: {
        items: games,
      },
    });
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
};

// Create a new game
export const createGame = async (req, res) => {
  const { startDate, endDate, sponsorId } = req.body;

  // Validate input data
  if (!startDate || !endDate || !sponsorId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const collection = getCollection('games');
    const sponsorsCollection = getCollection('sponsors');

    // Check if the current date is between the start and end dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const currentDate = new Date(); // Get the current date to check if it's the current week
    const isCurrentWeek = currentDate >= start && currentDate <= end;

    // Find sponsor details using sponsorId
    const sponsor = await sponsorsCollection.findOne({ id: sponsorId });

    // Generate a custom unique ID based on timestamp and random number
    const newGameId = Date.now() + Math.floor(Math.random() * 1000);

    // Prepare the new game object with missing fields
    const newGame = {
      id: newGameId,
      startDate,
      endDate,
      sponsorId,
      sponsor: sponsor.name,
      isCurrentWeek,
      createdAt: new Date(),
    };

    // Insert the new game into the collection
    const result = await collection.insertOne(newGame);

    // Query the game that was just inserted
    const insertedGame = await collection.findOne({ _id: result.insertedId });

    // Respond with the created game
    res.status(201).json({
      response: {
        items: insertedGame,
      },
    });
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({ error: 'Failed to create game' });
  }
};

// Update an existing game
export const updateGame = async (req, res) => {
  const { id } = req.params;
  const { startDate, endDate, sponsorId } = req.body;

  try {
    const collection = getCollection('games');
    const sponsorsCollection = getCollection('sponsors');

    // Find the sponsor details using the sponsorId
    const sponsor = await sponsorsCollection.findOne({ id: sponsorId });

    const updatedGame = await collection.updateOne(
      { id: Number(id) },
      {
        $set: {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          sponsorId,
          sponsor: sponsor.name,
        },
      },
    );

    if (updatedGame.modifiedCount > 0) {
      res.json({
        response: {
          items: updatedGame,
        },
      });
    } else {
      res.status(404).json({ error: 'Game not found' });
    }
  } catch (error) {
    console.error('Error updating game:', error);
    res.status(500).json({ error: 'Failed to update game' });
  }
};
