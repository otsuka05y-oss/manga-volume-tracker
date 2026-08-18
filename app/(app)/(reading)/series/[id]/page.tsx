import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { SeriesDetail } from "@/components/SeriesDetail";

export default async function SeriesDetailPage(
  props: PageProps<"/series/[id]">
) {
  const { id } = await props.params;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("series")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  return <SeriesDetail series={data} />;
}
