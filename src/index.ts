import { Hono } from 'hono';
import { authMiddleware } from './middleware/auth.js';
import userRoutes from './controllers/user.js';
import apiRoutes from './controllers/api.js';

const app = new Hono();

app.use('/api/*', authMiddleware);
app.route('/', userRoutes);
app.route('/api/', apiRoutes);

export default app;
