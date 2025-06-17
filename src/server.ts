import dotenv from 'dotenv';
dotenv.config();

import { serve } from '@hono/node-server';
import app from './index.js';

console.log("Server starting...");

serve(app, () => {
  console.log("Server is running on http://localhost:3000");
});
