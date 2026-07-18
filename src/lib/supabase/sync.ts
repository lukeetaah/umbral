import { listLocal } from "@/src/lib/local-store";
import { getSupabaseClient } from "./client";

export async function syncLocalSessions() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase no está configurado; el modo local sigue disponible.");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Iniciá sesión antes de sincronizar.");
  const records = (await listLocal()).filter(record => record.kind === "session");
  if (!records.length) return 0;
  const rows = records.map(record => ({ id: record.id, user_id: user.id, status: "completed", started_at: record.createdAt, completed_at: record.createdAt, source: "local-import", client_snapshot: record.payload }));
  const { error } = await supabase.from("sessions").upsert(rows, { onConflict: "id" });
  if (error) throw error;
  return rows.length;
}

export type CollectiveLearningSnapshot = {
  response_count: number;
  signal_count: number;
  control_count: number;
  signal_positive_rate: number | null;
  control_positive_rate: number | null;
  category_counts: Record<string, number>;
  promising_genomes: Array<{ seed: number; genome_hash: string; observations: number; positive_rate: number }>;
  minimum_group_size: number;
  updated_at: string | null;
};

type StoredSession = {
  lab?: string;
  trial?: { condition?: string; seed?: number };
  genomeHash?: string;
  occurred?: boolean | null;
  category?: string;
  confidence?: number;
  expectation?: number;
};

export async function contributeLocalSessions() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("La contribución colectiva todavía no está configurada. Tus respuestas siguen aprendiendo sólo en este dispositivo.");
  const records = (await listLocal()).filter(record => record.kind === "session");
  if (!records.length) throw new Error("Todavía no hay respuestas para aportar.");
  const rows = records.map(record => {
    const payload = record.payload as StoredSession;
    return {
      id: record.id,
      lab: payload.lab,
      condition: payload.trial?.condition,
      stimulus_seed: payload.trial?.seed,
      genome_hash: payload.genomeHash,
      occurred: payload.occurred,
      category: payload.occurred ? (payload.category ?? "otra") : "none",
      confidence: payload.confidence ?? 50,
      expectation: payload.expectation ?? 50,
      engine_version: "0.2",
      algorithm_version: "0.1",
    };
  });
  let contributed = 0;
  for (let index = 0; index < rows.length; index += 32) {
    const { data, error } = await supabase.rpc("submit_anonymous_contributions", { p_rows: rows.slice(index,index+32) });
    if (error) throw error;
    contributed += Number(data ?? 0);
  }
  return contributed;
}

export async function getCollectiveLearningSnapshot(): Promise<CollectiveLearningSnapshot | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("get_collective_learning_snapshot");
  if (error) throw error;
  return data as CollectiveLearningSnapshot;
}
