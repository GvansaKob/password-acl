import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { getUser, LoginSchema, setUser, userExist } from "../models/User.js";
import { hashPassword, verifyPassword } from "../services/hashing.js";
import { generateTokens, verifyRefreshToken } from "../services/JWT.js";
import { z } from "zod";
import { createRefreshToken, deleteRefreshToken, existsRefreshToken, TokenSchema, updateRefreshToken } from "../models/Token.js";
import { authMiddleware } from "../middleware/auth.js";
import crypto from 'crypto';
import { RegisterSchema } from "../models/User.js";

const route = new Hono();


route.post('/register', zValidator('json', RegisterSchema), async (c) => {
  try {
    const validatedUser = c.req.valid("json");

    if (userExist(validatedUser.username)) {
      return c.json({ error: "Nom d'utilisateur déjà pris" }, 400);
    }

    const { password: hashedPassword, salt } = await hashPassword(validatedUser.password);
    const userId = crypto.randomUUID();

    const user = {
      id: userId,
      ...validatedUser,
      password: hashedPassword,
      salt
    };

    setUser(user);
    const tokens = generateTokens({ userId, username: user.username, role: user.role });
    createRefreshToken(tokens.refreshToken);

    return c.json({ message: 'Utilisateur créé avec succès', ...tokens }, 201);
  } catch (error) {
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

route.post('/login', zValidator("json", LoginSchema), async (c) => {
  try {
    const validatedCredentials = c.req.valid("json");
    const user = getUser(validatedCredentials.username);
    if (!user) return c.json({ error: 'Utilisateur non trouvé' }, 404);

    const isValid = await verifyPassword(validatedCredentials.password, user.salt, user.password);
    if (!isValid) return c.json({ error: 'Mot de passe incorrect' }, 401);

    const tokens = generateTokens({ userId: user.id, username: user.username, role: user.role });
    createRefreshToken(tokens.refreshToken);
    return c.json(tokens);
  } catch {
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

route.post('/refresh-token', zValidator("json", TokenSchema), async (c) => {
  try {
    const { refreshToken } = c.req.valid("json");
    if (!existsRefreshToken(refreshToken)) return c.json({ error: 'Refresh token invalide' }, 401);

    const decoded = verifyRefreshToken(refreshToken);
    const tokens = generateTokens({ userId: decoded.userId, username: decoded.username, role: decoded.role });

    updateRefreshToken(refreshToken, tokens.refreshToken);
    return c.json(tokens);
  } catch {
    return c.json({ error: 'Refresh token invalide ou expiré' }, 401);
  }
});

route.post('/logout', authMiddleware, async (c) => {
  try {
    const refreshToken = c.req.header('X-Refresh-Token');
    if (refreshToken) deleteRefreshToken(refreshToken);
    return c.json({ message: 'Déconnexion réussie' });
  } catch {
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

route.get('/', (c) => c.text('API Password-ACL en route 🚀'));


export default route;
