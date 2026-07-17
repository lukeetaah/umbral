import { z } from "zod";

export const stimulusGenomeSchema = z.object({
  seed: z.number().int().nonnegative(),
  version: z.literal("0.1"),
  carrierHz: z.number().min(80).max(1200),
  modHz: z.number().min(0).max(40),
  durationMs: z.number().min(250).max(8000),
  gain: z.number().min(0).max(0.22),
  waveform: z.enum(["sine", "triangle", "noise"]),
  pan: z.number().min(-0.7).max(0.7),
  sham: z.boolean(),
});

export type StimulusGenome = z.infer<typeof stimulusGenomeSchema>;

export function hashGenome(genome: StimulusGenome): string {
  const source = JSON.stringify(genome, Object.keys(genome).sort());
  let hash = 2166136261;
  for (let i = 0; i < source.length; i += 1) hash = Math.imul(hash ^ source.charCodeAt(i), 16777619);
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function genomeFromSeed(seed: number, sham = false): StimulusGenome {
  const random = mulberry32(seed);
  return stimulusGenomeSchema.parse({ seed, version: "0.1", carrierHz: Math.round(180 + random() * 520), modHz: Math.round(random() * 14), durationMs: 2200, gain: 0.12, waveform: random() > 0.82 ? "triangle" : "sine", pan: Number((random() * 0.8 - 0.4).toFixed(2)), sham });
}

export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => { state += 0x6D2B79F5; let t = state; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
