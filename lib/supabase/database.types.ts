// Generado desde Supabase (`supabase gen types typescript`). No editar a mano:
// regenerar después de cada migración.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      categorias: {
        Row: {
          activa: boolean
          created_at: string
          descripcion: string | null
          id: string
          imagen_url: string | null
          nombre: string
          orden: number
          slug: string
        }
        Insert: {
          activa?: boolean
          created_at?: string
          descripcion?: string | null
          id?: string
          imagen_url?: string | null
          nombre: string
          orden?: number
          slug: string
        }
        Update: {
          activa?: boolean
          created_at?: string
          descripcion?: string | null
          id?: string
          imagen_url?: string | null
          nombre?: string
          orden?: number
          slug?: string
        }
        Relationships: []
      }
      direcciones: {
        Row: {
          codigo_postal: string | null
          created_at: string
          departamento: string
          direccion: string
          distrito: string
          es_predeterminada: boolean
          id: string
          nombre_destinatario: string
          provincia: string
          referencia: string | null
          telefono: string
          usuario_id: string
        }
        Insert: {
          codigo_postal?: string | null
          created_at?: string
          departamento: string
          direccion: string
          distrito: string
          es_predeterminada?: boolean
          id?: string
          nombre_destinatario: string
          provincia: string
          referencia?: string | null
          telefono: string
          usuario_id: string
        }
        Update: {
          codigo_postal?: string | null
          created_at?: string
          departamento?: string
          direccion?: string
          distrito?: string
          es_predeterminada?: boolean
          id?: string
          nombre_destinatario?: string
          provincia?: string
          referencia?: string | null
          telefono?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "direcciones_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      items_pedido: {
        Row: {
          cantidad: number
          color: string | null
          id: string
          nombre_producto: string
          pedido_id: string
          precio_unitario: number
          producto_id: string | null
          subtotal: number | null
          talla: string | null
          variante_id: string | null
        }
        Insert: {
          cantidad: number
          color?: string | null
          id?: string
          nombre_producto: string
          pedido_id: string
          precio_unitario: number
          producto_id?: string | null
          subtotal?: number | null
          talla?: string | null
          variante_id?: string | null
        }
        Update: {
          cantidad?: number
          color?: string | null
          id?: string
          nombre_producto?: string
          pedido_id?: string
          precio_unitario?: number
          producto_id?: string | null
          subtotal?: number | null
          talla?: string | null
          variante_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "items_pedido_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_pedido_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_pedido_variante_id_fkey"
            columns: ["variante_id"]
            isOneToOne: false
            referencedRelation: "variantes"
            referencedColumns: ["id"]
          },
        ]
      }
      pagos: {
        Row: {
          created_at: string
          culqi_charge_id: string | null
          culqi_order_id: string | null
          culqi_token_id: string | null
          error_mensaje: string | null
          estado: Database["public"]["Enums"]["estado_pago"]
          id: string
          marca_tarjeta: string | null
          metodo: Database["public"]["Enums"]["metodo_pago"] | null
          moneda: string
          monto: number
          pedido_id: string
          respuesta_culqi: Json | null
          ultimos_4_digitos: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          culqi_charge_id?: string | null
          culqi_order_id?: string | null
          culqi_token_id?: string | null
          error_mensaje?: string | null
          estado?: Database["public"]["Enums"]["estado_pago"]
          id?: string
          marca_tarjeta?: string | null
          metodo?: Database["public"]["Enums"]["metodo_pago"] | null
          moneda?: string
          monto: number
          pedido_id: string
          respuesta_culqi?: Json | null
          ultimos_4_digitos?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          culqi_charge_id?: string | null
          culqi_order_id?: string | null
          culqi_token_id?: string | null
          error_mensaje?: string | null
          estado?: Database["public"]["Enums"]["estado_pago"]
          id?: string
          marca_tarjeta?: string | null
          metodo?: Database["public"]["Enums"]["metodo_pago"] | null
          moneda?: string
          monto?: number
          pedido_id?: string
          respuesta_culqi?: Json | null
          ultimos_4_digitos?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pagos_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos: {
        Row: {
          costo_envio: number
          created_at: string
          direccion_envio: Json
          email_comprador: string
          estado: Database["public"]["Enums"]["estado_pedido"]
          id: string
          igv: number
          moneda: string
          nombre_comprador: string
          notas: string | null
          numero: number
          subtotal: number
          telefono_comprador: string | null
          total: number
          updated_at: string
          usuario_id: string | null
        }
        Insert: {
          costo_envio?: number
          created_at?: string
          direccion_envio: Json
          email_comprador: string
          estado?: Database["public"]["Enums"]["estado_pedido"]
          id?: string
          igv?: number
          moneda?: string
          nombre_comprador: string
          notas?: string | null
          numero?: number
          subtotal: number
          telefono_comprador?: string | null
          total: number
          updated_at?: string
          usuario_id?: string | null
        }
        Update: {
          costo_envio?: number
          created_at?: string
          direccion_envio?: Json
          email_comprador?: string
          estado?: Database["public"]["Enums"]["estado_pedido"]
          id?: string
          igv?: number
          moneda?: string
          nombre_comprador?: string
          notas?: string | null
          numero?: number
          subtotal?: number
          telefono_comprador?: string | null
          total?: number
          updated_at?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      perfiles: {
        Row: {
          apellidos: string | null
          created_at: string
          dni: string | null
          id: string
          nombre: string
          telefono: string | null
          updated_at: string
        }
        Insert: {
          apellidos?: string | null
          created_at?: string
          dni?: string | null
          id: string
          nombre: string
          telefono?: string | null
          updated_at?: string
        }
        Update: {
          apellidos?: string | null
          created_at?: string
          dni?: string | null
          id?: string
          nombre?: string
          telefono?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      productos: {
        Row: {
          activo: boolean
          categoria_id: string | null
          created_at: string
          descripcion: string | null
          destacado: boolean
          genero: string
          id: string
          imagenes: Json
          nombre: string
          orden: number
          precio: number
          precio_oferta: number | null
          sku: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          activo?: boolean
          categoria_id?: string | null
          created_at?: string
          descripcion?: string | null
          destacado?: boolean
          genero?: string
          id?: string
          imagenes?: Json
          nombre: string
          orden?: number
          precio: number
          precio_oferta?: number | null
          sku?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          activo?: boolean
          categoria_id?: string | null
          created_at?: string
          descripcion?: string | null
          destacado?: boolean
          genero?: string
          id?: string
          imagenes?: Json
          nombre?: string
          orden?: number
          precio?: number
          precio_oferta?: number | null
          sku?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "productos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      variantes: {
        Row: {
          activa: boolean
          color: string | null
          created_at: string
          id: string
          orden: number
          producto_id: string
          sku_variante: string | null
          stock: number
          talla: string | null
        }
        Insert: {
          activa?: boolean
          color?: string | null
          created_at?: string
          id?: string
          orden?: number
          producto_id: string
          sku_variante?: string | null
          stock?: number
          talla?: string | null
        }
        Update: {
          activa?: boolean
          color?: string | null
          created_at?: string
          id?: string
          orden?: number
          producto_id?: string
          sku_variante?: string | null
          stock?: number
          talla?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "variantes_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      descontar_stock: {
        Args: { p_cantidad: number; p_variante_id: string }
        Returns: undefined
      }
      es_admin: { Args: never; Returns: boolean }
      registrar_pedido_pagado: {
        Args: { p_items: Json; p_pago: Json; p_pedido: Json }
        Returns: { id: string; numero: number }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      estado_pago: "pendiente" | "completado" | "fallido" | "reembolsado"
      estado_pedido:
        | "pendiente"
        | "pagado"
        | "preparando"
        | "enviado"
        | "entregado"
        | "cancelado"
        | "reembolsado"
      metodo_pago: "tarjeta" | "yape" | "plin" | "cuotas"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      estado_pago: ["pendiente", "completado", "fallido", "reembolsado"],
      estado_pedido: [
        "pendiente",
        "pagado",
        "preparando",
        "enviado",
        "entregado",
        "cancelado",
        "reembolsado",
      ],
      metodo_pago: ["tarjeta", "yape", "plin", "cuotas"],
    },
  },
} as const
