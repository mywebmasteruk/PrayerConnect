export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      prayers: {
        Row: {
          id: number
          content: string
          author: string | null
          category: string | null
          created_at: string | null
          is_published: boolean | null
          view_count: number | null
          ameen_count: number | null
        }
        Insert: {
          id?: number
          content: string
          author?: string | null
          category?: string | null
          created_at?: string | null
          is_published?: boolean | null
          view_count?: number | null
          ameen_count?: number | null
        }
        Update: {
          id?: number
          content?: string
          author?: string | null
          category?: string | null
          created_at?: string | null
          is_published?: boolean | null
          view_count?: number | null
          ameen_count?: number | null
        }
      }
      users: {
        Row: {
          id: number
          username: string
          password: string
        }
        Insert: {
          id?: number
          username: string
          password: string
        }
        Update: {
          id?: number
          username?: string
          password?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}