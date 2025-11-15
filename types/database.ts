export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      clock_events: {
        Row: {
          id: string
          employee_id: string
          site_id: string
          type: 'IN' | 'OUT'
          timestamp: string
          lat: number
          lng: number
          accuracy_meters: number | null
          device_label: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          site_id: string
          type: 'IN' | 'OUT'
          timestamp?: string
          lat: number
          lng: number
          accuracy_meters?: number | null
          device_label?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          site_id?: string
          type?: 'IN' | 'OUT'
          timestamp?: string
          lat?: number
          lng?: number
          accuracy_meters?: number | null
          device_label?: string | null
          status?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clock_events_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clock_events_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          }
        ]
      }
      employees: {
        Row: {
          id: string
          full_name: string
          role: string
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          role?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      sites: {
        Row: {
          id: string
          name: string
          address: string
          latitude: number
          longitude: number
          radius_meters: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          latitude: number
          longitude: number
          radius_meters?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          latitude?: number
          longitude?: number
          radius_meters?: number
          created_at?: string
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
