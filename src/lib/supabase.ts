import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_ANON_KEY!

// 创建Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseKey)

// 创建管理员客户端（用于服务端操作）
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// 数据库类型定义
export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: number
          name: string
          slug: string
          description: string | null
          image: string | null
          sort: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          slug: string
          description?: string | null
          image?: string | null
          sort?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          description?: string | null
          image?: string | null
          sort?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: number
          name: string
          slug: string
          description: string | null
          price: number
          original_price: number | null
          images: any
          specifications: any | null
          features: any | null
          category_id: number
          is_hot: boolean
          is_new: boolean
          stock: number
          sort: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          slug: string
          description?: string | null
          price: number
          original_price?: number | null
          images: any
          specifications?: any | null
          features?: any | null
          category_id: number
          is_hot?: boolean
          is_new?: boolean
          stock?: number
          sort?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          description?: string | null
          price?: number
          original_price?: number | null
          images?: any
          specifications?: any | null
          features?: any | null
          category_id?: number
          is_hot?: boolean
          is_new?: boolean
          stock?: number
          sort?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      inquiries: {
        Row: {
          id: number
          name: string
          phone: string
          email: string | null
          company: string | null
          message: string
          status: 'PENDING' | 'REPLIED' | 'CLOSED'
          admin_reply: string | null
          replied_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          phone: string
          email?: string | null
          company?: string | null
          message: string
          status?: 'PENDING' | 'REPLIED' | 'CLOSED'
          admin_reply?: string | null
          replied_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          phone?: string
          email?: string | null
          company?: string | null
          message?: string
          status?: 'PENDING' | 'REPLIED' | 'CLOSED'
          admin_reply?: string | null
          replied_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      cases: {
        Row: {
          id: number
          title: string
          slug: string
          description: string
          location: string
          area: string | null
          project_type: string
          images: any
          materials: any | null
          client_name: string | null
          completed_at: string | null
          is_active: boolean
          sort: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          slug: string
          description: string
          location: string
          area?: string | null
          project_type: string
          images: any
          materials?: any | null
          client_name?: string | null
          completed_at?: string | null
          is_active?: boolean
          sort?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          slug?: string
          description?: string
          location?: string
          area?: string | null
          project_type?: string
          images?: any
          materials?: any | null
          client_name?: string | null
          completed_at?: string | null
          is_active?: boolean
          sort?: number
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: number
          username: string
          email: string
          password: string
          name: string
          role: 'ADMIN' | 'EDITOR'
          avatar: string | null
          is_active: boolean
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          username: string
          email: string
          password: string
          name: string
          role?: 'ADMIN' | 'EDITOR'
          avatar?: string | null
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          username?: string
          email?: string
          password?: string
          name?: string
          role?: 'ADMIN' | 'EDITOR'
          avatar?: string | null
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      settings: {
        Row: {
          id: number
          key: string
          value: string
          type: string
          group: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          key: string
          value: string
          type: string
          group: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          key?: string
          value?: string
          type?: string
          group?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      analytics: {
        Row: {
          id: number
          path: string
          user_agent: string | null
          ip: string
          referer: string | null
          created_at: string
        }
        Insert: {
          id?: number
          path: string
          user_agent?: string | null
          ip: string
          referer?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          path?: string
          user_agent?: string | null
          ip?: string
          referer?: string | null
          created_at?: string
        }
      }
    }
  }
}