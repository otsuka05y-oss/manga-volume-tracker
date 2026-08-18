import { getSupabaseAdmin } from "@/lib/supabase/server";
import { BookShelf } from "@/components/BookShelf";

export default async function HomePage() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("series")
    .select("*")
    .order("title", { ascending: true });

  if (error) {
    return (
      <p className="text-red-500 p-4">読み込みに失敗しました: {error.message}</p>
    );
  }

  return <BookShelf initialSeries={data ?? []} />;
}
