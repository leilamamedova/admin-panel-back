import express from 'express';
import {
  getUsers,
  toggleUserActivation,
} from '../controllers/userController.js';
import {
  getGames,
  createGame,
  updateGame,
} from '../controllers/gameController.js';
import { getSponsors } from '../controllers/sponsorController.js';
import { login } from '../controllers/authController.js';

const router = express.Router();

// Route for getting users
router.get('/users', getUsers);

// Route for toggling user activation
router.put('/users/:id/activation-status', toggleUserActivation);

// Route for getting games with filters (page, limit, etc.)
router.get('/games', getGames);

// Route for creating a new game
router.post('/games', createGame);

// Route for updating an existing game by ID
router.put('/games/:id', updateGame);

// Route for getting sponsors
router.get('/sponsors', getSponsors);

// Route for login
router.post('/login', login);

export default router;
