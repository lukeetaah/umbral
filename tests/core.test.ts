import { beforeEach, describe, expect, it } from "vitest";
import { IDBFactory } from "fake-indexeddb";
import { buildProtocol } from "../src/lib/protocol-engine";
import { genomeFromSeed, hashGenome, stimulusGenomeSchema } from "../src/lib/stimulus-genome";
import { decide, latinHypercube, scoreObservation } from "../src/lib/possibility-engine";
import { clearLocal, listLocal, saveLocal } from "../src/lib/local-store";

describe("reproducible core",()=>{it("rebuilds identical genomes",()=>{const a=genomeFromSeed(42);const b=genomeFromSeed(42);expect(a).toEqual(b);expect(hashGenome(a)).toBe(hashGenome(b));expect(stimulusGenomeSchema.parse(a).gain).toBeLessThanOrEqual(.22)});it("balances sham and omission deterministically",()=>{const a=buildProtocol(99);const b=buildProtocol(99);expect(a).toEqual(b);expect(a[0].condition).toBe("paired");expect(a.some(t=>t.condition==="sham")).toBe(true);expect(a.some(t=>t.condition==="omission")).toBe(true)});it("samples a bounded latin hypercube",()=>{const points=latinHypercube(8,5,3);expect(points).toHaveLength(5);expect(points.flat().every(v=>v>=0&&v<1)).toBe(true)});it("penalizes adverse and expectation dependence",()=>{const genome=genomeFromSeed(3);const clean=scoreObservation({genome,similarity:.8,controlDifference:.8,reproducibility:.8,expectation:.1,adverse:0,confidence:.8});const risky=scoreObservation({genome,similarity:.8,controlDifference:.8,reproducibility:.8,expectation:.9,adverse:.3,confidence:.8});expect(clean).toBeGreaterThan(risky);expect(decide("skeptic",3).output.sham).toBe(true)})});

describe("local-only data",()=>{beforeEach(()=>{Object.defineProperty(globalThis,"indexedDB",{value:new IDBFactory(),configurable:true});});it("saves, exports via listing, and deletes",async()=>{await saveLocal({id:"one",createdAt:new Date(0).toISOString(),kind:"session",payload:{answer:false}});expect(await listLocal()).toHaveLength(1);await clearLocal();expect(await listLocal()).toHaveLength(0)})});
