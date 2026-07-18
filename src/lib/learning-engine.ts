import type { LocalRecord } from "@/src/lib/local-store";
import { genomeFromSeed } from "@/src/lib/stimulus-genome";
import type { Observation } from "@/src/lib/possibility-engine";

type StoredTrial = {
  condition?: string;
  seed?: number;
};

type StoredResponse = {
  lab?: string;
  trial?: StoredTrial;
  occurred?: boolean | null;
  category?: string;
  confidence?: number;
  expectation?: number;
  genomeHash?: string;
};

export type SeedLearning = {
  seed: number;
  score: number;
  observations: number;
};

export type PersonalLearningModel = {
  version: "0.1";
  responseCount: number;
  signalCount: number;
  controlCount: number;
  signalPositiveRate: number | null;
  controlPositiveRate: number | null;
  signalLift: number | null;
  topCategory: string | null;
  categoryCounts: Record<string, number>;
  promisingSeeds: SeedLearning[];
  nextProtocolSeed: number;
  uncertainty: number;
  status: "starting" | "learning" | "promising" | "no-separation";
};

function asStoredResponse(record: LocalRecord): StoredResponse | null {
  if (record.kind !== "session") return null;
  return record.payload as StoredResponse;
}

function rate(positive: number, total: number) {
  return total ? Number((positive / total).toFixed(3)) : null;
}

export function buildPersonalLearningModel(records: LocalRecord[]): PersonalLearningModel {
  const responses = records.map(asStoredResponse).filter((value): value is StoredResponse => value !== null && value.occurred !== null && value.occurred !== undefined);
  const signal = responses.filter(response => response.trial?.condition !== "sham" && response.trial?.condition !== "preparation");
  const controls = responses.filter(response => response.trial?.condition === "sham" || response.trial?.condition === "preparation");
  const signalPositiveRate = rate(signal.filter(response => response.occurred).length, signal.length);
  const controlPositiveRate = rate(controls.filter(response => response.occurred).length, controls.length);
  const signalLift = signalPositiveRate === null || controlPositiveRate === null ? null : Number((signalPositiveRate - controlPositiveRate).toFixed(3));

  const categoryCounts: Record<string, number> = {};
  for (const response of responses) {
    if (!response.occurred || !response.category || response.category === "none" || response.category === "otra") continue;
    categoryCounts[response.category] = (categoryCounts[response.category] ?? 0) + 1;
  }
  const topCategory = Object.entries(categoryCounts).toSorted((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] ?? null;

  const bySeed = new Map<number, { total: number; observations: number }>();
  for (const response of signal) {
    const seed = response.trial?.seed;
    if (!Number.isInteger(seed)) continue;
    const confidence = Math.max(0, Math.min(100, response.confidence ?? 50)) / 100;
    const expectation = Math.max(0, Math.min(100, response.expectation ?? 50)) / 100;
    const score = response.occurred ? confidence - expectation * 0.35 : -0.12;
    const current = bySeed.get(seed as number) ?? { total: 0, observations: 0 };
    current.total += score;
    current.observations += 1;
    bySeed.set(seed as number, current);
  }
  const promisingSeeds = Array.from(bySeed, ([seed, value]) => ({
    seed,
    score: Number((value.total / value.observations).toFixed(3)),
    observations: value.observations,
  })).toSorted((a, b) => b.score - a.score || b.observations - a.observations).slice(0, 3);

  const responseCount = responses.length;
  const baseSeed = promisingSeeds[0]?.seed ?? 41027;
  const nextProtocolSeed = responseCount === 0 ? 41027 : ((Math.imul(baseSeed ^ (responseCount + 1), 2654435761) >>> 0) % 1_000_000) + 1;
  const status = responseCount < 8 ? "starting" : signalLift === null ? "learning" : signalLift >= 0.15 ? "promising" : "no-separation";

  return {
    version: "0.1",
    responseCount,
    signalCount: signal.length,
    controlCount: controls.length,
    signalPositiveRate,
    controlPositiveRate,
    signalLift,
    topCategory,
    categoryCounts,
    promisingSeeds,
    nextProtocolSeed,
    uncertainty: responseCount ? Number(Math.min(1, 1 / Math.sqrt(responseCount)).toFixed(3)) : 1,
    status,
  };
}

export function explainPersonalLearning(model: PersonalLearningModel, language: "es" | "en") {
  if (language === "en") {
    if (model.status === "starting") return `UMBRAL has ${model.responseCount} answers. It needs more comparisons before preferring one sound over another.`;
    if (model.status === "promising") return "Your responses appeared more often with signals than with controls. The next session will retest the most promising region.";
    if (model.status === "no-separation") return "No sound has separated clearly from the controls yet. The next session will explore a different region.";
    return "UMBRAL is still comparing signals with controls before adapting the next session.";
  }
  if (model.status === "starting") return `UMBRAL tiene ${model.responseCount} respuestas tuyas. Necesita más comparaciones antes de preferir un sonido.`;
  if (model.status === "promising") return "Tus respuestas aparecieron más con señales que con controles. La próxima sesión volverá a probar la zona más prometedora.";
  if (model.status === "no-separation") return "Todavía ningún sonido se separó claramente de los controles. La próxima sesión explorará otra zona.";
  return "UMBRAL sigue comparando señales con controles antes de adaptar la próxima sesión.";
}

export function observationsFromPersonalModel(model: PersonalLearningModel): Observation[] {
  return model.promisingSeeds.map(item=>({
    genome:genomeFromSeed(item.seed),
    similarity:Math.max(0,Math.min(1,(item.score+0.12)/0.9)),
    controlDifference:Math.max(0.1,model.signalLift??0.1),
    reproducibility:Math.min(1,item.observations/3),
    expectation:0.5,
    adverse:0,
    confidence:Math.max(0.25,1-model.uncertainty),
  }));
}
