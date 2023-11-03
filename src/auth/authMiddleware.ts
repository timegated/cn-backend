// authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { supabase } from '../supabase/supabase-client';

export async function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1]; // Expecting "Bearer [token]"

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // Depending on the version, this method may vary
    const { data: session, error } = await supabase.auth.getUser(token);

    if (error) throw error;

    req.user = session.user;
    next();
  } catch (error: any) {
    return res.status(401).json({ message: 'Invalid token', error: error.message });
  }
}
