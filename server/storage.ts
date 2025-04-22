import { prayers, type Prayer, type InsertPrayer, users, type User, type InsertUser } from "@shared/schema";
import { eq, and, ilike, or, desc, sql } from "drizzle-orm";
import { db } from "./db";

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

export class DatabaseStorage implements IStorage {
  async getPrayers(page: number, limit: number, category?: string, search?: string): Promise<Prayer[]> {
    let conditions = [eq(prayers.is_published, true)];
    
    if (category && category !== 'all') {
      conditions.push(eq(prayers.category, category));
    }
    
    if (search) {
      conditions.push(
        or(
          ilike(prayers.content, `%${search}%`),
          ilike(prayers.author || '', `%${search}%`)
        )
      );
    }
    
    const prayerResults = await db.select()
      .from(prayers)
      .where(and(...conditions))
      .orderBy(desc(prayers.created_at))
      .limit(limit)
      .offset((page - 1) * limit);
    
    return prayerResults;
  }

  async getPrayer(id: number): Promise<Prayer | undefined> {
    const [prayer] = await db.select()
      .from(prayers)
      .where(eq(prayers.id, id));
    return prayer;
  }

  async createPrayer(insertPrayer: InsertPrayer): Promise<Prayer> {
    const [prayer] = await db.insert(prayers)
      .values({
        content: insertPrayer.content,
        author: insertPrayer.author || 'Anonymous',
        category: insertPrayer.category
      })
      .returning();
    
    return prayer;
  }

  async updatePrayer(id: number, updates: Partial<Prayer>): Promise<Prayer | undefined> {
    if (Object.keys(updates).length === 0) {
      return this.getPrayer(id);
    }
    
    const [updatedPrayer] = await db.update(prayers)
      .set(updates)
      .where(eq(prayers.id, id))
      .returning();
    
    return updatedPrayer;
  }

  async deletePrayer(id: number): Promise<boolean> {
    const result = await db.delete(prayers)
      .where(eq(prayers.id, id))
      .returning();
    return result.length > 0;
  }

  async incrementAmeenCount(id: number): Promise<boolean> {
    const prayer = await this.getPrayer(id);
    if (!prayer) return false;
    
    const [result] = await db.update(prayers)
      .set({ ameen_count: (prayer.ameen_count || 0) + 1 })
      .where(eq(prayers.id, id))
      .returning();
    
    return !!result;
  }

  async incrementViewCount(id: number): Promise<boolean> {
    const prayer = await this.getPrayer(id);
    if (!prayer) return false;
    
    const [result] = await db.update(prayers)
      .set({ view_count: (prayer.view_count || 0) + 1 })
      .where(eq(prayers.id, id))
      .returning();
    
    return !!result;
  }

  async getTotalPrayers(category?: string, search?: string): Promise<number> {
    let conditions = [eq(prayers.is_published, true)];
    
    if (category && category !== 'all') {
      conditions.push(eq(prayers.category, category));
    }
    
    if (search) {
      conditions.push(
        or(
          ilike(prayers.content, `%${search}%`),
          ilike(prayers.author || '', `%${search}%`)
        )
      );
    }
    
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(prayers)
      .where(and(...conditions));
    
    return result.length > 0 ? Number(result[0].count) : 0;
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
}

export const storage = new DatabaseStorage();
