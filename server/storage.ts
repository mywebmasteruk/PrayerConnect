import { type Prayer, type InsertPrayer, type User, type InsertUser } from "@shared/schema";
import { supabase } from "./supabase";

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

export class SupabaseStorage implements IStorage {
  async getPrayers(page: number, limit: number, category?: string, search?: string): Promise<Prayer[]> {
    let query = supabase.from('prayers')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    
    if (search) {
      // Note: This is a simplified search - Supabase doesn't directly support OR with ILIKE
      // In a production app, you might want to use pg_trgm extension or a more complex query
      query = query.ilike('content', `%${search}%`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching prayers:', error);
      return [];
    }
    
    return data as Prayer[];
  }

  async getPrayer(id: number): Promise<Prayer | undefined> {
    const { data, error } = await supabase
      .from('prayers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching prayer:', error);
      return undefined;
    }
    
    return data as Prayer;
  }

  async createPrayer(insertPrayer: InsertPrayer): Promise<Prayer> {
    const { data, error } = await supabase
      .from('prayers')
      .insert({
        content: insertPrayer.content,
        author: insertPrayer.author || 'Anonymous',
        category: insertPrayer.category,
        is_published: true,
        view_count: 0,
        ameen_count: 0
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating prayer:', error);
      throw new Error('Failed to create prayer');
    }
    
    return data as Prayer;
  }

  async updatePrayer(id: number, updates: Partial<Prayer>): Promise<Prayer | undefined> {
    if (Object.keys(updates).length === 0) {
      return this.getPrayer(id);
    }
    
    const { data, error } = await supabase
      .from('prayers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating prayer:', error);
      return undefined;
    }
    
    return data as Prayer;
  }

  async deletePrayer(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('prayers')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting prayer:', error);
      return false;
    }
    
    return true;
  }

  async incrementAmeenCount(id: number): Promise<boolean> {
    const prayer = await this.getPrayer(id);
    if (!prayer) return false;
    
    const { data, error } = await supabase.rpc('increment_ameen_count', { prayer_id: id });
    
    if (error) {
      console.error('Error incrementing ameen count:', error);
      
      // Fallback if the RPC function doesn't exist yet
      const { error: updateError } = await supabase
        .from('prayers')
        .update({ ameen_count: (prayer.ameen_count || 0) + 1 })
        .eq('id', id);
      
      if (updateError) {
        console.error('Error in fallback update:', updateError);
        return false;
      }
    }
    
    return true;
  }

  async incrementViewCount(id: number): Promise<boolean> {
    const prayer = await this.getPrayer(id);
    if (!prayer) return false;
    
    const { data, error } = await supabase.rpc('increment_view_count', { prayer_id: id });
    
    if (error) {
      console.error('Error incrementing view count:', error);
      
      // Fallback if the RPC function doesn't exist yet
      const { error: updateError } = await supabase
        .from('prayers')
        .update({ view_count: (prayer.view_count || 0) + 1 })
        .eq('id', id);
      
      if (updateError) {
        console.error('Error in fallback update:', updateError);
        return false;
      }
    }
    
    return true;
  }

  async getTotalPrayers(category?: string, search?: string): Promise<number> {
    let query = supabase
      .from('prayers')
      .select('id', { count: 'exact', head: true })
      .eq('is_published', true);
    
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    
    if (search) {
      query = query.ilike('content', `%${search}%`);
    }
    
    const { count, error } = await query;
    
    if (error) {
      console.error('Error getting prayer count:', error);
      return 0;
    }
    
    return count || 0;
  }

  async getUser(id: number): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching user:', error);
      return undefined;
    }
    
    return data as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error) {
      console.error('Error fetching user by username:', error);
      return undefined;
    }
    
    return data as User;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        username: insertUser.username,
        password: insertUser.password
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
    
    return data as User;
  }
}

export const storage = new SupabaseStorage();
