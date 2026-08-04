export type OrderStatus = "recebido" | "em_preparo" | "pronto" | "entregue" | "cancelado";
export type MenuCategory = "marmita" | "addon_cutlery" | "addon_drink";
export type StaffRole = "owner" | "kitchen" | "counter";

export type OrderItemSnapshot = {
  menu_item_id: string;
  name: string;
  price_cents: number;
  proteins?: string[];
  quantity: number;
};

export type Database = {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string;
          slug: string;
          name: string;
          timezone: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["tenants"]["Row"]> & { slug: string; name: string };
        Update: Partial<Database["public"]["Tables"]["tenants"]["Row"]>;
        Relationships: [];
      };
      staff_profiles: {
        Row: {
          user_id: string;
          tenant_id: string;
          full_name: string;
          role: StaffRole;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["staff_profiles"]["Row"]> & {
          user_id: string;
          tenant_id: string;
          full_name: string;
          role: StaffRole;
        };
        Update: Partial<Database["public"]["Tables"]["staff_profiles"]["Row"]>;
        Relationships: [];
      };
      menu_items: {
        Row: {
          id: string;
          tenant_id: string;
          category: MenuCategory;
          name: string;
          short_name: string;
          description: string | null;
          volume_label: string | null;
          price_cents: number;
          protein_options: string[] | null;
          protein_pick_count: number | null;
          sort_order: number;
          active: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["menu_items"]["Row"]> & {
          tenant_id: string;
          category: MenuCategory;
          name: string;
          short_name: string;
          price_cents: number;
        };
        Update: Partial<Database["public"]["Tables"]["menu_items"]["Row"]>;
        Relationships: [];
      };
      pickup_window_templates: {
        Row: {
          id: string;
          tenant_id: string;
          start_time: string;
          end_time: string;
          capacity: number;
          is_peak: boolean;
          sort_order: number;
          active: boolean;
        };
        Insert: Partial<Database["public"]["Tables"]["pickup_window_templates"]["Row"]> & {
          tenant_id: string;
          start_time: string;
          end_time: string;
          capacity: number;
        };
        Update: Partial<Database["public"]["Tables"]["pickup_window_templates"]["Row"]>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          tenant_id: string;
          ticket_number: number | null;
          customer_name: string;
          customer_phone: string;
          pickup_date: string;
          pickup_window_template_id: string;
          status: OrderStatus;
          items: OrderItemSnapshot[];
          notes: string | null;
          total_cents: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          tenant_id: string;
          customer_name: string;
          customer_phone: string;
          pickup_date: string;
          pickup_window_template_id: string;
          items: OrderItemSnapshot[];
          notes?: string | null;
          total_cents: number;
          status?: OrderStatus;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "orders_pickup_window_template_id_fkey";
            columns: ["pickup_window_template_id"];
            isOneToOne: false;
            referencedRelation: "pickup_window_templates";
            referencedColumns: ["id"];
          },
        ];
      };
      order_status_events: {
        Row: {
          id: string;
          order_id: string;
          status: OrderStatus;
          changed_at: string;
          changed_by: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["order_status_events"]["Row"]> & {
          order_id: string;
          status: OrderStatus;
        };
        Update: Partial<Database["public"]["Tables"]["order_status_events"]["Row"]>;
        Relationships: [];
      };
      daily_counters: {
        Row: {
          tenant_id: string;
          pickup_date: string;
          last_ticket_number: number;
        };
        Insert: Partial<Database["public"]["Tables"]["daily_counters"]["Row"]> & {
          tenant_id: string;
          pickup_date: string;
        };
        Update: Partial<Database["public"]["Tables"]["daily_counters"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_order: {
        Args: {
          p_tenant_slug: string;
          p_customer_name: string;
          p_customer_phone: string;
          p_pickup_date: string;
          p_pickup_window_id: string;
          p_marmita_item_id: string;
          p_protein_choice: string[];
          p_cutlery: boolean;
          p_drink_item_id: string | null;
          p_notes: string | null;
        };
        Returns: { order_id: string; ticket_number: number; total_cents: number }[];
      };
      auth_tenant_id: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
