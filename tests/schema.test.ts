import { readFileSync } from "node:fs";
import { describe,expect,it } from "vitest";

describe("Supabase schema",()=>{
  const sql=readFileSync("supabase/migrations/001_initial_schema.sql","utf8");
  it("enables RLS on every required table",()=>{for(const table of ["profiles","user_roles","consent_documents","user_consents","research_sources","hypotheses","protocols","protocol_versions","stimulus_genomes","perceptual_chords","experiments","sessions","trials","responses","phenomenology_reports","personal_models","algorithm_decisions","adverse_events","feature_flags","audit_events","deletion_requests"])expect(sql).toContain("alter table public."+table+" enable row level security")});
  it("keeps chocolate disabled",()=>{expect(readFileSync("supabase/seed.sql","utf8")).toContain("'chocolate_pathway',false")});
  it("keeps consent and algorithm provenance append-only",()=>{const hardening=readFileSync("supabase/migrations/002_append_only_research_audit.sql","utf8");expect(hardening).toContain("protect_consent_history");expect(hardening).toContain("decisions_self_insert");expect(hardening).not.toContain("for all")});
  it("accepts only opt-in anonymous contributions and exposes aggregates",()=>{const collective=readFileSync("supabase/migrations/003_anonymous_collective_learning.sql","utf8");expect(collective).toContain("alter table public.anonymous_contributions enable row level security");expect(collective).toContain("revoke all on table public.anonymous_contributions from anon, authenticated");expect(collective).toContain("submit_anonymous_contributions");expect(collective).toContain("get_collective_learning_snapshot");expect(collective).toContain("having count(*) >= 5");expect(collective).toContain("No email, account id, IP, free text, or session identifier")});
  it("ships deterministic colored-noise worklet support",()=>{const worklet=readFileSync("public/audio-worklet.js","utf8");expect(worklet).toContain('"brown"');expect(worklet).toContain('"white"');expect(worklet).toContain("registerProcessor")});
});
