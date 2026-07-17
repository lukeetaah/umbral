import { mulberry32 } from "@/src/lib/stimulus-genome";
export type TrialCondition = "paired" | "repetition" | "sham" | "omission" | "transfer";
export type TrialPlan = { index: number; condition: TrialCondition; seed: number; target: "color" | "shape" | "none" };
export function buildProtocol(seed: number, length = 8): TrialPlan[] { const random = mulberry32(seed); const conditions: TrialCondition[] = ["paired","paired","repetition","sham","paired","omission","transfer","sham"]; return conditions.slice(0,length).map((condition,index):TrialPlan => ({ index, condition, seed: Math.floor(random()*1_000_000), target: condition === "sham" ? "none" : index % 2 ? "shape" : "color" })).toSorted(() => random() - .5); }
