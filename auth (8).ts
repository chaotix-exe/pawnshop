import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import Todo from "./Todo";

export const dynamic = "force-dynamic";

export default async function TodoPage() {
  await requireUser();
  const { data } = await supabaseAdmin().from("craft_todos").select("*").eq("klaar", false).order("created_at", { ascending: false });
  return <Todo open={(data as any) || []} />;
}
