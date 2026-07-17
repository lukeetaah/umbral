import { mulberry32 } from "@/src/lib/stimulus-genome";
export type TrialCondition = "paired" | "repetition" | "sham" | "omission" | "transfer";
export type TrialPlan = { index: number; condition: TrialCondition; seed: number; target: "color" | "shape" | "none" };
export function buildProtocol(seed: number, length = 8): TrialPlan[] {
  const random = mulberry32(seed);
  const conditions: TrialCondition[] = ["paired","paired","repetition","sham","paired","omission","transfer","sham"];
  const [first, ...rest] = conditions.slice(0, length);
  for (let index = rest.length - 1; index > 0; index -= 1) {
    const swapWith = Math.floor(random() * (index + 1));
    [rest[index], rest[swapWith]] = [rest[swapWith], rest[index]];
  }
  return (first ? [first, ...rest] : []).map((condition, index): TrialPlan => ({
    index,
    condition,
    seed: Math.floor(random() * 1_000_000),
    target: condition === "sham" ? "none" : index % 2 ? "shape" : "color",
  }));
}
