import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();
const prisma = new PrismaClient();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(400).json({ error: 'User registration failed' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(400).json({ error: 'Login failed' });
  }
});

export default router;