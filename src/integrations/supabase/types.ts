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
      activities: {
        Row: {
          activity_type: string
          clinic_id: string | null
          created_at: string | null
          description: string | null
          end_time: string
          id: string
          professional_id: string | null
          start_time: string
          title: string
        }
        Insert: {
          activity_type: string
          clinic_id?: string | null
          created_at?: string | null
          description?: string | null
          end_time: string
          id?: string
          professional_id?: string | null
          start_time: string
          title: string
        }
        Update: {
          activity_type?: string
          clinic_id?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string
          id?: string
          professional_id?: string | null
          start_time?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "vw_bed_occupation"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "activities_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_participants: {
        Row: {
          activity_id: string | null
          attendance_status: string | null
          created_at: string | null
          id: string
          patient_id: string | null
        }
        Insert: {
          activity_id?: string | null
          attendance_status?: string | null
          created_at?: string | null
          id?: string
          patient_id?: string | null
        }
        Update: {
          activity_id?: string | null
          attendance_status?: string | null
          created_at?: string | null
          id?: string
          patient_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_participants_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_participants_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      admissions: {
        Row: {
          actual_discharge_date: string | null
          admission_date: string | null
          bed_id: string | null
          clinic_id: string | null
          created_at: string | null
          discharge_reason: string | null
          expected_discharge_date: string | null
          id: string
          patient_id: string | null
        }
        Insert: {
          actual_discharge_date?: string | null
          admission_date?: string | null
          bed_id?: string | null
          clinic_id?: string | null
          created_at?: string | null
          discharge_reason?: string | null
          expected_discharge_date?: string | null
          id?: string
          patient_id?: string | null
        }
        Update: {
          actual_discharge_date?: string | null
          admission_date?: string | null
          bed_id?: string | null
          clinic_id?: string | null
          created_at?: string | null
          discharge_reason?: string | null
          expected_discharge_date?: string | null
          id?: string
          patient_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admissions_bed_id_fkey"
            columns: ["bed_id"]
            isOneToOne: false
            referencedRelation: "beds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admissions_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admissions_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "vw_bed_occupation"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "admissions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      beds: {
        Row: {
          bed_number: string
          bed_type: string
          clinic_id: string | null
          created_at: string | null
          id: string
          patient_id: string | null
          status: string
        }
        Insert: {
          bed_number: string
          bed_type: string
          clinic_id?: string | null
          created_at?: string | null
          id?: string
          patient_id?: string | null
          status: string
        }
        Update: {
          bed_number?: string
          bed_type?: string
          clinic_id?: string | null
          created_at?: string | null
          id?: string
          patient_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "beds_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beds_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "vw_bed_occupation"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "beds_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_users: {
        Row: {
          clinic_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_users_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_users_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "vw_bed_occupation"
            referencedColumns: ["clinic_id"]
          },
        ]
      }
      clinics: {
        Row: {
          address: string | null
          admin_email: string
          admin_id: string
          available_beds: number | null
          beds_capacity: number | null
          created_at: string | null
          has_beds_data: boolean | null
          has_initial_data: boolean | null
          id: string
          maintenance_beds: number | null
          monthly_fee: number | null
          name: string
          occupied_beds: number | null
          phone: string | null
          plan: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          admin_email: string
          admin_id: string
          available_beds?: number | null
          beds_capacity?: number | null
          created_at?: string | null
          has_beds_data?: boolean | null
          has_initial_data?: boolean | null
          id?: string
          maintenance_beds?: number | null
          monthly_fee?: number | null
          name: string
          occupied_beds?: number | null
          phone?: string | null
          plan?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          admin_email?: string
          admin_id?: string
          available_beds?: number | null
          beds_capacity?: number | null
          created_at?: string | null
          has_beds_data?: boolean | null
          has_initial_data?: boolean | null
          id?: string
          maintenance_beds?: number | null
          monthly_fee?: number | null
          name?: string
          occupied_beds?: number | null
          phone?: string | null
          plan?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      contracts: {
        Row: {
          clinic_id: string | null
          created_at: string | null
          end_date: string | null
          file_url: string | null
          id: string
          patient_id: string | null
          responsible_document: string
          responsible_name: string
          start_date: string | null
          status: string | null
          value: number | null
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string | null
          end_date?: string | null
          file_url?: string | null
          id?: string
          patient_id?: string | null
          responsible_document: string
          responsible_name: string
          start_date?: string | null
          status?: string | null
          value?: number | null
        }
        Update: {
          clinic_id?: string | null
          created_at?: string | null
          end_date?: string | null
          file_url?: string | null
          id?: string
          patient_id?: string | null
          responsible_document?: string
          responsible_name?: string
          start_date?: string | null
          status?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "vw_bed_occupation"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "contracts_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          clinic_id: string | null
          created_at: string | null
          created_by: string | null
          document_type: string
          file_url: string | null
          id: string
          patient_id: string | null
          title: string
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string | null
          created_by?: string | null
          document_type: string
          file_url?: string | null
          id?: string
          patient_id?: string | null
          title: string
        }
        Update: {
          clinic_id?: string | null
          created_at?: string | null
          created_by?: string | null
          document_type?: string
          file_url?: string | null
          id?: string
          patient_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "vw_bed_occupation"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "documents_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      finances: {
        Row: {
          amount: number
          category: string | null
          clinic_id: string | null
          created_at: string | null
          date: string | null
          description: string | null
          id: string
          reference_id: string | null
          reference_type: string | null
          type: string
        }
        Insert: {
          amount: number
          category?: string | null
          clinic_id?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          type: string
        }
        Update: {
          amount?: number
          category?: string | null
          clinic_id?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "finances_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finances_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "vw_bed_occupation"
            referencedColumns: ["clinic_id"]
          },
        ]
      }
      medication_administrations: {
        Row: {
          administered_at: string
          administered_by: string
          clinic_id: string
          created_at: string | null
          created_by: string | null
          dosage: string
          id: string
          medication_id: string
          observations: string | null
          patient_id: string
          prescription_id: string
          status: string
        }
        Insert: {
          administered_at?: string
          administered_by: string
          clinic_id: string
          created_at?: string | null
          created_by?: string | null
          dosage: string
          id?: string
          medication_id: string
          observations?: string | null
          patient_id: string
          prescription_id: string
          status?: string
        }
        Update: {
          administered_at?: string
          administered_by?: string
          clinic_id?: string
          created_at?: string | null
          created_by?: string | null
          dosage?: string
          id?: string
          medication_id?: string
          observations?: string | null
          patient_id?: string
          prescription_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "medication_administrations_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_administrations_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "vw_bed_occupation"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "medication_administrations_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medication_inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_administrations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_administrations_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "medication_prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_inventory: {
        Row: {
          active: string
          batch_number: string | null
          category: string
          clinic_id: string
          created_at: string | null
          created_by: string | null
          dosage: string
          expiration_date: string | null
          id: string
          manufacturer: string | null
          name: string
          observations: string | null
          status: string
          stock: number
          updated_at: string | null
        }
        Insert: {
          active: string
          batch_number?: string | null
          category: string
          clinic_id: string
          created_at?: string | null
          created_by?: string | null
          dosage: string
          expiration_date?: string | null
          id?: string
          manufacturer?: string | null
          name: string
          observations?: string | null
          status?: string
          stock?: number
          updated_at?: string | null
        }
        Update: {
          active?: string
          batch_number?: string | null
          category?: string
          clinic_id?: string
          created_at?: string | null
          created_by?: string | null
          dosage?: string
          expiration_date?: string | null
          id?: string
          manufacturer?: string | null
          name?: string
          observations?: string | null
          status?: string
          stock?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medication_inventory_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_inventory_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "vw_bed_occupation"
            referencedColumns: ["clinic_id"]
          },
        ]
      }
      medication_prescriptions: {
        Row: {
          clinic_id: string
          created_at: string | null
          created_by: string | null
          dosage: string
          end_date: string | null
          frequency: string
          id: string
          medication_id: string
          observations: string | null
          patient_id: string
          start_date: string
          status: string
        }
        Insert: {
          clinic_id: string
          created_at?: string | null
          created_by?: string | null
          dosage: string
          end_date?: string | null
          frequency: string
          id?: string
          medication_id: string
          observations?: string | null
          patient_id: string
          start_date?: string
          status?: string
        }
        Update: {
          clinic_id?: string
          created_at?: string | null
          created_by?: string | null
          dosage?: string
          end_date?: string | null
          frequency?: string
          id?: string
          medication_id?: string
          observations?: string | null
          patient_id?: string
          start_date?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "medication_prescriptions_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_prescriptions_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "vw_bed_occupation"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "medication_prescriptions_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medication_inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_stock_history: {
        Row: {
          adjustment_type: string
          clinic_id: string
          created_at: string | null
          created_by: string | null
          id: string
          medication_id: string
          notes: string | null
          quantity: number
        }
        Insert: {
          adjustment_type: string
          clinic_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          medication_id: string
          notes?: string | null
          quantity: number
        }
        Update: {
          adjustment_type?: string
          clinic_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          medication_id?: string
          notes?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "medication_stock_history_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_stock_history_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "vw_bed_occupation"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "medication_stock_history_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medication_inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          clinic_id: string | null
          created_at: string | null
          dosage: string | null
          end_date: string | null
          frequency: string | null
          id: string
          name: string
          notes: string | null
          patient_id: string | null
          start_date: string | null
          status: string | null
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string | null
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          name: string
          notes?: string | null
          patient_id?: string | null
          start_date?: string | null
          status?: string | null
        }
        Update: {
          clinic_id?: string | null
          created_at?: string | null
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          name?: string
          notes?: string | null
          patient_id?: string | null
          start_date?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medications_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medications_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "vw_bed_occupation"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "medications_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          admission_date: string | null
          admission_type: string
          clinic_id: string | null
          created_at: string | null
          emergency_contact: string | null
          id: string
          medical_record: string | null
          name: string
          phone: string | null
          status: string
        }
        Insert: {
          admission_date?: string | null
          admission_type: string
          clinic_id?: string | null
          created_at?: string | null
          emergency_contact?: string | null
          id?: string
          medical_record?: string | null
          name: string
          phone?: string | null
          status?: string
        }
        Update: {
          admission_date?: string | null
          admission_type?: string
          clinic_id?: string | null
          created_at?: string | null
          emergency_contact?: string | null
          id?: string
          medical_record?: string | null
          name?: string
          phone?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "vw_bed_occupation"
            referencedColumns: ["clinic_id"]
          },
        ]
      }
      professionals: {
        Row: {
          clinic_id: string | null
          created_at: string | null
          email: string | null
          id: string
          license: string | null
          name: string
          phone: string | null
          profession: string
          status: string
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          license?: string | null
          name: string
          phone?: string | null
          profession: string
          status?: string
        }
        Update: {
          clinic_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          license?: string | null
          name?: string
          phone?: string | null
          profession?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "professionals_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professionals_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "vw_bed_occupation"
            referencedColumns: ["clinic_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          id: string
          is_admin: boolean | null
          name: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          id: string
          is_admin?: boolean | null
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          id?: string
          is_admin?: boolean | null
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      vw_bed_occupation: {
        Row: {
          available_beds: number | null
          beds_capacity: number | null
          clinic_id: string | null
          clinic_name: string | null
          has_beds_data: boolean | null
          maintenance_beds: number | null
          occupation_percentage: number | null
          occupied_beds: number | null
        }
        Insert: {
          available_beds?: number | null
          beds_capacity?: number | null
          clinic_id?: string | null
          clinic_name?: string | null
          has_beds_data?: boolean | null
          maintenance_beds?: number | null
          occupation_percentage?: never
          occupied_beds?: number | null
        }
        Update: {
          available_beds?: number | null
          beds_capacity?: number | null
          clinic_id?: string | null
          clinic_name?: string | null
          has_beds_data?: boolean | null
          maintenance_beds?: number | null
          occupation_percentage?: never
          occupied_beds?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_clinic_member: {
        Args: { clinic_uuid: string }
        Returns: boolean
      }
      recalculate_bed_counters: {
        Args: { clinic_uuid: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "master_admin" | "clinic_admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["master_admin", "clinic_admin", "user"],
    },
  },
} as const
