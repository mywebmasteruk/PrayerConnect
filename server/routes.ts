import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { supabase } from "./supabase";
import session from "express-session";
import { z } from "zod";
import { ZodError } from "zod-validation-error";
import { insertPrayerSchema } from "@shared/schema";
import MemoryStore from "memorystore";

// Extend the Express session type to include our custom properties
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    isAdmin?: boolean;
    supabaseAccessToken?: string;
  }
}

// Session store
const MemoryStoreSession = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Use session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'dua-prayer-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 }, // 24 hours
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // prune expired entries every 24h
    })
  }));

  // Admin middleware to check authentication
  const requireAdmin = (req: Request, res: Response, next: Function) => {
    if (req.session.isAdmin) {
      next();
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  };

  // API routes
  app.post('/api/prayers', async (req: Request, res: Response) => {
    try {
      const validatedData = insertPrayerSchema.parse(req.body);
      
      const prayer = await storage.createPrayer(validatedData);
      res.status(201).json(prayer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: 'Validation error', 
          errors: error.errors 
        });
      } else {
        console.error('Error creating prayer:', error);
        res.status(500).json({ message: 'Error creating prayer' });
      }
    }
  });

  app.get('/api/prayers', async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 6;
      let category = req.query.category as string | undefined;
      const search = req.query.search as string | undefined;

      // Don't filter by category if it's "all"
      if (category === 'all') {
        category = undefined;
      }

      const prayers = await storage.getPrayers(page, limit, category, search);
      const total = await storage.getTotalPrayers(category, search);
      
      res.json({
        prayers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching prayers:', error);
      res.status(500).json({ message: 'Error fetching prayers' });
    }
  });

  app.get('/api/prayers/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const prayer = await storage.getPrayer(id);
      
      if (!prayer) {
        return res.status(404).json({ message: 'Prayer not found' });
      }
      
      // Increment view count
      await storage.incrementViewCount(id);
      
      // Return prayer with incremented view count
      const updatedPrayer = await storage.getPrayer(id);
      res.json(updatedPrayer);
    } catch (error) {
      console.error('Error fetching prayer:', error);
      res.status(500).json({ message: 'Error fetching prayer' });
    }
  });

  app.post('/api/prayers/:id/ameen', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.incrementAmeenCount(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Prayer not found' });
      }
      
      const updatedPrayer = await storage.getPrayer(id);
      res.json(updatedPrayer);
    } catch (error) {
      console.error('Error updating ameen count:', error);
      res.status(500).json({ message: 'Error updating ameen count' });
    }
  });

  // Admin routes
  app.post('/api/admin/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
      
      // Use Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Supabase auth error:', error);
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Set session after successful authentication
      req.session.userId = data.user.id;
      req.session.isAdmin = true;
      req.session.supabaseAccessToken = data.session.access_token;
      
      res.json({ success: true, user: { email: data.user.email } });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/admin/prayers', requireAdmin, async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      let category = req.query.category as string | undefined;
      const search = req.query.search as string | undefined;

      // Don't filter by category if it's "all"
      if (category === 'all') {
        category = undefined;
      }

      // Get all prayers including unpublished ones for admin
      const prayers = await storage.getPrayers(page, limit, category, search);
      const total = await storage.getTotalPrayers(category, search);
      
      res.json({
        prayers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching prayers for admin:', error);
      res.status(500).json({ message: 'Error fetching prayers' });
    }
  });

  app.patch('/api/admin/prayers/:id', requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      // Only allow updating certain fields
      const allowedUpdates = ['is_published'];
      const filteredUpdates: Record<string, any> = {};
      
      for (const key of allowedUpdates) {
        if (key in updates) {
          filteredUpdates[key] = updates[key];
        }
      }
      
      const updatedPrayer = await storage.updatePrayer(id, filteredUpdates);
      
      if (!updatedPrayer) {
        return res.status(404).json({ message: 'Prayer not found' });
      }
      
      res.json(updatedPrayer);
    } catch (error) {
      console.error('Error updating prayer:', error);
      res.status(500).json({ message: 'Error updating prayer' });
    }
  });

  app.delete('/api/admin/prayers/:id', requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePrayer(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Prayer not found' });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting prayer:', error);
      res.status(500).json({ message: 'Error deleting prayer' });
    }
  });

  // For checking admin status
  app.get('/api/admin/status', (req: Request, res: Response) => {
    res.json({ isAdmin: !!req.session.isAdmin });
  });

  // Logout admin
  app.post('/api/admin/logout', async (req: Request, res: Response) => {
    try {
      // Sign out of Supabase if we have a token
      if (req.session.supabaseAccessToken) {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Error signing out of Supabase:', error);
        }
      }
      
      // Destroy session regardless of Supabase result
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
          res.status(500).json({ message: 'Error logging out' });
        } else {
          res.json({ success: true });
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: 'Error logging out' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
