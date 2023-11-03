// authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { supabase } from '../supabase/supabase-client';

export async function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1]; // Expecting "Bearer [token]"

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const { data, error } = await supabase.auth.api.getUser(token);

  if (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  // Add the user info to the request object for downstream use
  req.user = data;
  next();
}
