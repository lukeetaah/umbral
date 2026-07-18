import { beforeEach, describe, expect, it } from "vitest";
import { IDBFactory } from "fake-indexeddb";
import { buildProtocol } from "../src/lib/protocol-engine";
import { genomeFromSeed, hashGenome, stimulusGenomeSchema } from "../src/lib/stimulus-genome";
import { decide, latinHypercube, scoreObservation } from "../src/lib/possibility-engine";
import { clearLocal, listLocal, saveLocal } from "../src/lib/local-store";
import { buildPersonalLearningModel } from "../src/lib/learning-engine";

describe("reproducible core",()=>{
  it("rebuilds identical bounded genomes",()=>{const a=genomeFromSeed(42);const b=genomeFromSeed(42);expect(a).toEqual(b);expect(hashGenome(a)).toBe(hashGenome(b));expect(stimulusGenomeSchema.parse(a).gain).toBeLessThanOrEqual(.16);expect(a.version).toBe("0.2")});
  it("balances sham and omission deterministically",()=>{const a=buildProtocol(99);const b=buildProtocol(99);expect(a).toEqual(b);expect(a[0].condition).toBe("paired");expect(a.some(t=>t.condition==="sham")).toBe(true);expect(a.some(t=>t.condition==="omission")).toBe(true);const repeated=a.filter(t=>t.cue==="A1");expect(new Set(repeated.map(t=>t.seed)).size).toBe(1)});
  it("retests preferred personal or collective seeds without removing controls",()=>{const protocol=buildProtocol(99,8,"atlas",[1234,5678]);expect(protocol.filter(trial=>trial.cue==="A1").every(trial=>trial.seed===1234)).toBe(true);expect(protocol.filter(trial=>trial.cue==="A2").every(trial=>trial.seed===5678)).toBe(true);expect(protocol.some(trial=>trial.condition==="sham")).toBe(true)});
  it("builds differentiated laboratory protocols",()=>{const labs=["atlas","apprenticeship","state","anchor"] as const;const protocols=labs.map(lab=>buildProtocol(7,8,lab));expect(new Set(protocols.map(protocol=>protocol.map(t=>t.phase).join("|"))).size).toBe(4);expect(protocols.every(protocol=>protocol[0].condition!=="sham")).toBe(true);expect(protocols[2].some(t=>t.load==="moderate")).toBe(true);expect(protocols[3].every(t=>t.target==="state"||t.target==="none")).toBe(true)});
  it("samples a bounded latin hypercube",()=>{const points=latinHypercube(8,5,3);expect(points).toHaveLength(5);expect(points.flat().every(v=>v>=0&&v<1)).toBe(true)});
  it("penalizes adverse and expectation dependence",()=>{const genome=genomeFromSeed(3);const clean=scoreObservation({genome,similarity:.8,controlDifference:.8,reproducibility:.8,expectation:.1,adverse:0,confidence:.8});const risky=scoreObservation({genome,similarity:.8,controlDifference:.8,reproducibility:.8,expectation:.9,adverse:.3,confidence:.8});expect(clean).toBeGreaterThan(risky);expect(decide("skeptic",3).output.sham).toBe(true)});
});

describe("local-only data",()=>{beforeEach(()=>{Object.defineProperty(globalThis,"indexedDB",{value:new IDBFactory(),configurable:true});});it("saves, exports via listing, and deletes",async()=>{await saveLocal({id:"one",createdAt:new Date(0).toISOString(),kind:"session",payload:{answer:false}});expect(await listLocal()).toHaveLength(1);await clearLocal();expect(await listLocal()).toHaveLength(0)})});

describe("personal learning",()=>{
  it("separates signals from controls and chooses a new reproducible seed",()=>{const records=[
    {id:"1",createdAt:"",kind:"session" as const,payload:{trial:{condition:"paired",seed:91},occurred:true,category:"color",confidence:90,expectation:20}},
    {id:"2",createdAt:"",kind:"session" as const,payload:{trial:{condition:"repetition",seed:91},occurred:true,category:"color",confidence:80,expectation:30}},
    {id:"3",createdAt:"",kind:"session" as const,payload:{trial:{condition:"sham",seed:12},occurred:false,category:"none",confidence:85,expectation:25}},
    {id:"4",createdAt:"",kind:"session" as const,payload:{trial:{condition:"sham",seed:13},occurred:false,category:"none",confidence:75,expectation:25}},
    {id:"5",createdAt:"",kind:"session" as const,payload:{trial:{condition:"paired",seed:72},occurred:false,category:"none",confidence:80,expectation:40}},
    {id:"6",createdAt:"",kind:"session" as const,payload:{trial:{condition:"paired",seed:72},occurred:false,category:"none",confidence:80,expectation:40}},
    {id:"7",createdAt:"",kind:"session" as const,payload:{trial:{condition:"omission",seed:91},occurred:true,category:"color",confidence:70,expectation:30}},
    {id:"8",createdAt:"",kind:"session" as const,payload:{trial:{condition:"paired",seed:91},occurred:true,category:"shape",confidence:70,expectation:30}},
  ];const model=buildPersonalLearningModel(records);expect(model.status).toBe("promising");expect(model.signalLift).toBeGreaterThan(0);expect(model.promisingSeeds[0].seed).toBe(91);expect(model.topCategory).toBe("color");expect(model.nextProtocolSeed).not.toBe(41027);expect(buildPersonalLearningModel(records).nextProtocolSeed).toBe(model.nextProtocolSeed)});
  it("does not pretend to learn from an empty history",()=>{const model=buildPersonalLearningModel([]);expect(model.status).toBe("starting");expect(model.responseCount).toBe(0);expect(model.signalLift).toBeNull();expect(model.nextProtocolSeed).toBe(41027)});
});
