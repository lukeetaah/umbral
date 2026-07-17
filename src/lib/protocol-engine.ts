import { mulberry32 } from "@/src/lib/stimulus-genome";
export type LabId = "atlas" | "apprenticeship" | "state" | "anchor";
export type TrialCondition = "baseline" | "paired" | "repetition" | "sham" | "omission" | "transfer" | "preparation";
export type TrialPlan = {
  index: number;
  lab: LabId;
  condition: TrialCondition;
  seed: number;
  cue: "A1" | "A2" | "B1" | "control";
  target: "color" | "shape" | "state" | "none";
  phase: string;
  visualStrength: 0 | 0.35 | 0.65 | 1;
  preparationMs: number;
  load: "low" | "moderate";
};

type Template = Omit<TrialPlan, "index" | "lab" | "seed">;

const templates: Record<LabId, Template[]> = {
  atlas: [
    { condition:"paired",cue:"A1",target:"color",phase:"mapeo inicial",visualStrength:1,preparationMs:0,load:"low" },
    { condition:"paired",cue:"A2",target:"shape",phase:"mapeo inicial",visualStrength:1,preparationMs:0,load:"low" },
    { condition:"sham",cue:"control",target:"none",phase:"control",visualStrength:0,preparationMs:0,load:"low" },
    { condition:"repetition",cue:"A1",target:"color",phase:"repetición oculta",visualStrength:1,preparationMs:0,load:"low" },
    { condition:"omission",cue:"A1",target:"none",phase:"omisión visual",visualStrength:0,preparationMs:0,load:"low" },
    { condition:"paired",cue:"B1",target:"shape",phase:"mapeo",visualStrength:1,preparationMs:0,load:"low" },
    { condition:"repetition",cue:"A2",target:"shape",phase:"repetición oculta",visualStrength:1,preparationMs:0,load:"low" },
    { condition:"sham",cue:"control",target:"none",phase:"control",visualStrength:0,preparationMs:0,load:"low" },
  ],
  apprenticeship: [
    { condition:"paired",cue:"A1",target:"color",phase:"A1 + C1",visualStrength:1,preparationMs:0,load:"low" },
    { condition:"repetition",cue:"A1",target:"color",phase:"A1 + C1",visualStrength:1,preparationMs:0,load:"low" },
    { condition:"transfer",cue:"B1",target:"color",phase:"B1 → A1 + C1",visualStrength:1,preparationMs:450,load:"low" },
    { condition:"transfer",cue:"B1",target:"color",phase:"B1 → A1 + C1 reducido",visualStrength:0.65,preparationMs:450,load:"low" },
    { condition:"omission",cue:"B1",target:"none",phase:"B1 → A1",visualStrength:0,preparationMs:450,load:"low" },
    { condition:"transfer",cue:"A2",target:"color",phase:"A2 → A1",visualStrength:0.35,preparationMs:450,load:"low" },
    { condition:"repetition",cue:"A2",target:"color",phase:"A2 → A1",visualStrength:0.35,preparationMs:450,load:"low" },
    { condition:"omission",cue:"A2",target:"none",phase:"A2",visualStrength:0,preparationMs:0,load:"low" },
  ],
  state: [
    { condition:"baseline",cue:"A1",target:"shape",phase:"estímulo solo",visualStrength:1,preparationMs:0,load:"low" },
    { condition:"preparation",cue:"control",target:"none",phase:"preparación sola",visualStrength:0,preparationMs:900,load:"low" },
    { condition:"paired",cue:"A1",target:"shape",phase:"preparación + estímulo",visualStrength:1,preparationMs:900,load:"low" },
    { condition:"sham",cue:"control",target:"none",phase:"preparación + control",visualStrength:0,preparationMs:900,load:"low" },
    { condition:"repetition",cue:"A1",target:"shape",phase:"baja carga visual",visualStrength:0.65,preparationMs:0,load:"low" },
    { condition:"repetition",cue:"A1",target:"shape",phase:"carga visual moderada",visualStrength:0.65,preparationMs:0,load:"moderate" },
    { condition:"paired",cue:"A2",target:"color",phase:"silencio previo",visualStrength:1,preparationMs:1200,load:"low" },
    { condition:"paired",cue:"A2",target:"color",phase:"sin silencio previo",visualStrength:1,preparationMs:0,load:"low" },
  ],
  anchor: [
    { condition:"baseline",cue:"control",target:"state",phase:"línea de base segura",visualStrength:1,preparationMs:0,load:"low" },
    { condition:"paired",cue:"A1",target:"state",phase:"firma + estado elegido",visualStrength:1,preparationMs:0,load:"low" },
    { condition:"repetition",cue:"A1",target:"state",phase:"repetición",visualStrength:1,preparationMs:0,load:"low" },
    { condition:"paired",cue:"A1",target:"state",phase:"fading",visualStrength:0.65,preparationMs:0,load:"low" },
    { condition:"omission",cue:"A1",target:"none",phase:"firma sin recordatorio",visualStrength:0,preparationMs:0,load:"low" },
    { condition:"sham",cue:"control",target:"none",phase:"control",visualStrength:0,preparationMs:0,load:"low" },
    { condition:"transfer",cue:"A2",target:"state",phase:"transferencia",visualStrength:0.35,preparationMs:350,load:"low" },
    { condition:"omission",cue:"A2",target:"none",phase:"retest local",visualStrength:0,preparationMs:0,load:"low" },
  ],
};

export function buildProtocol(seed: number, length = 8, lab: LabId = "atlas"): TrialPlan[] {
  const random = mulberry32(seed);
  const cueSeeds = { A1: Math.floor(random()*1_000_000), A2: Math.floor(random()*1_000_000), B1: Math.floor(random()*1_000_000), control: Math.floor(random()*1_000_000) };
  let ordered = templates[lab].slice(0, length);
  if (lab === "atlas") {
    const [first, ...rest] = ordered;
    for (let index = rest.length - 1; index > 0; index -= 1) {
      const swapWith = Math.floor(random() * (index + 1));
      [rest[index], rest[swapWith]] = [rest[swapWith], rest[index]];
    }
    ordered = first ? [first, ...rest] : [];
  }
  return ordered.map((trial, index): TrialPlan => ({
    ...trial,
    index,
    lab,
    seed: cueSeeds[trial.cue],
  }));
}
