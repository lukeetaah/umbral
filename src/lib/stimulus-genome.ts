import { z } from "zod";

export const stimulusGenomeSchema = z.object({
  seed: z.number().int().nonnegative(),
  version: z.literal("0.2"),
  carrierHz: z.number().min(80).max(1200),
  modHz: z.number().min(0).max(20),
  durationMs: z.number().min(250).max(8000),
  gain: z.number().min(0).max(0.16),
  waveform: z.enum(["sine", "triangle", "noise"]),
  noiseColor: z.enum(["white", "pink", "brown"]),
  beatMode: z.enum(["none", "monaural", "binaural"]),
  beatHz: z.number().min(0).max(12),
  harmonics: z.number().int().min(1).max(3),
  filterHz: z.number().min(300).max(4000),
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
  const waveformRoll = random();
  const beatRoll = random();
  return stimulusGenomeSchema.parse({
    seed,
    version: "0.2",
    carrierHz: Math.round(180 + random() * 520),
    modHz: Math.round(random() * 10),
    durationMs: 1800,
    gain: 0.12,
    waveform: waveformRoll > 0.82 ? "noise" : waveformRoll > 0.58 ? "triangle" : "sine",
    noiseColor: (["white", "pink", "brown"] as const)[Math.floor(random() * 3)],
    beatMode: beatRoll > 0.95 ? "binaural" : beatRoll > 0.8 ? "monaural" : "none",
    beatHz: Math.round(2 + random() * 6),
    harmonics: 1 + Math.floor(random() * 3),
    filterHz: Math.round(900 + random() * 2100),
    pan: Number((random() * 0.6 - 0.3).toFixed(2)),
    sham,
  });
}

export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => { state += 0x6D2B79F5; let t = state; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
