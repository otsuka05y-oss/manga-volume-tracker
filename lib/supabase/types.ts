export type ReleaseDateSource = "api" | "manual";

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

  owned_volume: number;
  last_updated_at: string;

  next_volume_number: number | null;
  next_volume_release_date: string | null;
  next_volume_isbn: string | null;
  release_date_source: ReleaseDateSource | null;
  release_date_checked_at: string | null;

  notified_for_volume: number | null;
  notified_at: string | null;

  created_at: string;
};

export type PushSubscriptionRow = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent: string | null;
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
      push_subscriptions: {
        Row: PushSubscriptionRow;
        Insert: Partial<PushSubscriptionRow> & {
          endpoint: string;
          p256dh: string;
          auth: string;
        };
        Update: Partial<PushSubscriptionRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
