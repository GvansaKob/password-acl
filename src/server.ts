import { Hono } from 'hono';
import dotenv from 'dotenv';
import userRoutes from './controllers/user.js';

dotenv.config();

const app = new Hono();

app.route('/', userRoutes);

app.get('/', (c) => c.text('API Password-ACL en route 🚀'));

app.fire();
