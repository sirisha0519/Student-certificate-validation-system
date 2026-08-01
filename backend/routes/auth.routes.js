import express from 'express';
import { register, login } from '../controllers/auth.controller.js';
import { registerValidator, loginValidator } from '../validators/auth.validator.js';

const router = express.Router();

// Route for registering a user
router.post('/register', registerValidator, register);

// Route for logging in a user
router.post('/login', loginValidator, login);

export default router;
