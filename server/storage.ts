import { prayers, type Prayer, type InsertPrayer, users, type User, type InsertUser } from "@shared/schema";
import { neon } from "@neondatabase/serverless";

export interface IStorage {
  // Prayer operations
  getPrayers(page: number, limit: number, category?: string, search?: string): Promise<Prayer[]>;
  getPrayer(id: number): Promise<Prayer | undefined>;
  createPrayer(prayer: InsertPrayer): Promise<Prayer>;
  updatePrayer(id: number, updates: Partial<Prayer>): Promise<Prayer | undefined>;
  deletePrayer(id: number): Promise<boolean>;
  incrementAmeenCount(id: number): Promise<boolean>;
  incrementViewCount(id: number): Promise<boolean>;
  getTotalPrayers(category?: string, search?: string): Promise<number>;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class MemStorage implements IStorage {
  private prayers: Map<number, Prayer>;
  private users: Map<number, User>;
  private prayerCurrentId: number;
  private userCurrentId: number;

  constructor() {
    this.prayers = new Map();
    this.users = new Map();
    this.prayerCurrentId = 1;
    this.userCurrentId = 1;
  }

  async getPrayers(page: number, limit: number, category?: string, search?: string): Promise<Prayer[]> {
    let prayers = Array.from(this.prayers.values());
    
    // Filter by category if provided
    if (category) {
      prayers = prayers.filter(prayer => prayer.category === category);
    }

    // Filter by search term if provided
    if (search) {
      const searchLower = search.toLowerCase();
      prayers = prayers.filter(prayer => 
        prayer.content.toLowerCase().includes(searchLower) || 
        prayer.author.toLowerCase().includes(searchLower)
      );
    }

    // Sort by date (newest first)
    prayers.sort((a, b) => {
      const dateA = new Date(a.created_at ?? Date.now());
      const dateB = new Date(b.created_at ?? Date.now());
      return dateB.getTime() - dateA.getTime();
    });

    // Paginate
    const startIndex = (page - 1) * limit;
    return prayers.slice(startIndex, startIndex + limit);
  }

  async getPrayer(id: number): Promise<Prayer | undefined> {
    return this.prayers.get(id);
  }

  async createPrayer(insertPrayer: InsertPrayer): Promise<Prayer> {
    const id = this.prayerCurrentId++;
    // Make sure to handle optional fields
    const prayer: Prayer = { 
      id,
      content: insertPrayer.content,
      author: insertPrayer.author || 'Anonymous',
      category: insertPrayer.category || null,
      is_published: true,
      view_count: 0,
      ameen_count: 0,
      created_at: new Date()
    };
    this.prayers.set(id, prayer);
    return prayer;
  }

  async updatePrayer(id: number, updates: Partial<Prayer>): Promise<Prayer | undefined> {
    const prayer = this.prayers.get(id);
    if (!prayer) return undefined;

    const updatedPrayer = { ...prayer, ...updates };
    this.prayers.set(id, updatedPrayer);
    return updatedPrayer;
  }

  async deletePrayer(id: number): Promise<boolean> {
    return this.prayers.delete(id);
  }

  async incrementAmeenCount(id: number): Promise<boolean> {
    const prayer = this.prayers.get(id);
    if (!prayer) return false;

    const updatedPrayer = { 
      ...prayer, 
      ameen_count: (prayer.ameen_count ?? 0) + 1 
    };
    this.prayers.set(id, updatedPrayer);
    return true;
  }

  async incrementViewCount(id: number): Promise<boolean> {
    const prayer = this.prayers.get(id);
    if (!prayer) return false;

    const updatedPrayer = { 
      ...prayer, 
      view_count: (prayer.view_count ?? 0) + 1 
    };
    this.prayers.set(id, updatedPrayer);
    return true;
  }

  async getTotalPrayers(category?: string, search?: string): Promise<number> {
    let prayers = Array.from(this.prayers.values());
    
    if (category) {
      prayers = prayers.filter(prayer => prayer.category === category);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      prayers = prayers.filter(prayer => 
        prayer.content.toLowerCase().includes(searchLower) || 
        prayer.author.toLowerCase().includes(searchLower)
      );
    }

    return prayers.length;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
}

export class SupabaseStorage implements IStorage {
  private db;
  
  constructor() {
    // Use the DATABASE_URL environment variable provided by Supabase
    this.db = neon(process.env.DATABASE_URL || "");
  }

  async getPrayers(page: number, limit: number, category?: string, search?: string): Promise<Prayer[]> {
    let query = `
      SELECT * FROM prayers 
      WHERE is_published = true
    `;
    
    const params: any[] = [];
    let paramIndex = 1;
    
    if (category) {
      query += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }
    
    if (search) {
      query += ` AND (content ILIKE $${paramIndex} OR author ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, (page - 1) * limit);
    
    const rows = await this.db(query, params);
    return rows;
  }

  async getPrayer(id: number): Promise<Prayer | undefined> {
    const rows = await this.db(
      'SELECT * FROM prayers WHERE id = $1',
      [id]
    );
    return rows[0];
  }

  async createPrayer(prayer: InsertPrayer): Promise<Prayer> {
    const rows = await this.db(
      `INSERT INTO prayers (content, author, category) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [prayer.content, prayer.author || 'Anonymous', prayer.category]
    );
    return rows[0];
  }

  async updatePrayer(id: number, updates: Partial<Prayer>): Promise<Prayer | undefined> {
    const fields = Object.keys(updates);
    const values = fields.map((field) => (updates as any)[field]);
    
    if (fields.length === 0) return this.getPrayer(id);
    
    const setClause = fields.map((field, i) => `${field} = $${i + 2}`).join(', ');
    
    const rows = await this.db(
      `UPDATE prayers SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    
    return rows[0];
  }

  async deletePrayer(id: number): Promise<boolean> {
    const result = await this.db(
      'DELETE FROM prayers WHERE id = $1',
      [id]
    );
    return Array.isArray(result) && result.length > 0;
  }

  async incrementAmeenCount(id: number): Promise<boolean> {
    const result = await this.db(
      'UPDATE prayers SET ameen_count = ameen_count + 1 WHERE id = $1 RETURNING id',
      [id]
    );
    return Array.isArray(result) && result.length > 0;
  }

  async incrementViewCount(id: number): Promise<boolean> {
    const result = await this.db(
      'UPDATE prayers SET view_count = view_count + 1 WHERE id = $1 RETURNING id',
      [id]
    );
    return Array.isArray(result) && result.length > 0;
  }

  async getTotalPrayers(category?: string, search?: string): Promise<number> {
    let query = 'SELECT COUNT(*) FROM prayers WHERE is_published = true';
    const params: any[] = [];
    let paramIndex = 1;
    
    if (category) {
      query += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }
    
    if (search) {
      query += ` AND (content ILIKE $${paramIndex} OR author ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
    }
    
    const rows = await this.db(query, params);
    return parseInt(rows[0].count);
  }

  async getUser(id: number): Promise<User | undefined> {
    const rows = await this.db(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return rows[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const rows = await this.db(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    return rows[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const rows = await this.db(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
      [user.username, user.password]
    );
    return rows[0];
  }
}

// Choose the storage implementation
const useDatabase = process.env.USE_DATABASE === 'true';
export const storage = useDatabase ? new SupabaseStorage() : new MemStorage();
