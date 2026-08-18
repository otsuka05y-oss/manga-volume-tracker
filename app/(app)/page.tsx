import { getSupabaseAdmin } from "@/lib/supabase/server";
import { SeriesList } from "@/components/SeriesList";

export default async function HomePage() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("series")
    .select("*")
    .order("title", { ascending: true });

  if (error) {
    return <p className="text-red-500">読み込みに失敗しました: {error.message}</p>;
  }

  return <SeriesList initialSeries={data ?? []} />;
}
