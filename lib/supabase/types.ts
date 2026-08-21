// Must be `type`, not `interface` — interfaces are open (declaration
// merging), so TS won't structurally match them against the
// Record<string, unknown>-based generic constraints supabase-js uses to
// resolve table row types, which silently collapses queries to `never`.
export type Series = {
  id: string;
  title: string;
  author: string | null;
  publisher: string | null;
  spine_color: string;
  title_font: string;
  is_completed: boolean;

  owned_volume: number;
  last_updated_at: string;

  created_at: string;
};

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13";
  };
  public: {
    Tables: {
      series: {
        Row: Series;
        Insert: Partial<Series> & { title: string };
        Update: Partial<Series>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
