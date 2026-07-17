import { mulberry32, stimulusGenomeSchema, type StimulusGenome } from "@/src/lib/stimulus-genome";

export class UmbralAudioEngine {
  private readonly masterLevel = 0.45;
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private workletReady = false;
  private activeSources = new Set<AudioScheduledSourceNode>();
  private activeNodes = new Set<AudioNode>();
  private cleanupTimers = new Set<ReturnType<typeof setTimeout>>();

  private async setup() {
    if (this.context) return;
    this.context = new AudioContext({ latencyHint: "interactive" });
    const limiter = this.context.createDynamicsCompressor();
    limiter.threshold.value = -18;
    limiter.knee.value = 8;
    limiter.ratio.value = 12;
    limiter.attack.value = 0.004;
    limiter.release.value = 0.18;
    this.master = this.context.createGain();
    this.master.gain.value = 0.0001;
    this.master.connect(limiter).connect(this.context.destination);
    try {
      await this.context.audioWorklet.addModule("/audio-worklet.js");
      this.workletReady = true;
    } catch {
      this.workletReady = false;
    }
  }

  private rememberSource(source: AudioScheduledSourceNode) {
    this.activeSources.add(source);
    source.addEventListener("ended", () => this.activeSources.delete(source), { once: true });
  }

  private rememberNode(node: AudioNode, durationMs: number) {
    this.activeNodes.add(node);
    const timer = setTimeout(() => {
      try { node.disconnect(); } catch { /* already disconnected */ }
      this.activeNodes.delete(node);
      this.cleanupTimers.delete(timer);
    }, durationMs + 180);
    this.cleanupTimers.add(timer);
  }

  private createNoiseFallback(context: AudioContext, genome: StimulusGenome) {
    const length = Math.ceil(context.sampleRate * genome.durationMs / 1000);
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const output = buffer.getChannelData(0);
    const random = mulberry32(genome.seed);
    let brown = 0;
    let b0 = 0; let b1 = 0; let b2 = 0; let b3 = 0; let b4 = 0; let b5 = 0; let b6 = 0;
    for (let index = 0; index < length; index += 1) {
      const white = random() * 2 - 1;
      if (genome.noiseColor === "white") output[index] = white * 0.34;
      else if (genome.noiseColor === "brown") {
        brown = (brown + 0.02 * white) / 1.02;
        output[index] = Math.max(-1, Math.min(1, brown * 3.2)) * 0.34;
      } else {
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        b6 = white * 0.115926;
        output[index] = Math.max(-1, Math.min(1, pink * 0.11)) * 0.34;
      }
    }
    const source = context.createBufferSource();
    source.buffer = buffer;
    return source;
  }

  async play(input: StimulusGenome) {
    const genome = stimulusGenomeSchema.parse(input);
    await this.setup();
    const context = this.context;
    const master = this.master;
    if (!context || !master) throw new Error("No se pudo iniciar el audio en este navegador.");
    await context.resume();
    if (context.state !== "running") throw new Error("El navegador bloqueó el audio. Tocá de nuevo el botón de reproducción.");
    this.stop();
    if (genome.sham) return;

    const start = context.currentTime + 0.06;
    const end = start + genome.durationMs / 1000;
    master.gain.setValueAtTime(0.0001, start);
    master.gain.exponentialRampToValueAtTime(this.masterLevel, start + 0.04);

    const envelope = context.createGain();
    const filter = context.createBiquadFilter();
    const outputPan = context.createStereoPanner();
    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.exponentialRampToValueAtTime(genome.gain, start + 0.04);
    envelope.gain.setValueAtTime(genome.gain, end - 0.08);
    envelope.gain.exponentialRampToValueAtTime(0.0001, end);
    filter.type = "lowpass";
    filter.frequency.value = genome.filterHz;
    filter.Q.value = 0.7;
    outputPan.pan.value = genome.beatMode === "binaural" ? 0 : genome.pan;
    envelope.connect(filter).connect(outputPan).connect(master);

    if (genome.waveform === "noise") {
      if (this.workletReady) {
        const worklet = new AudioWorkletNode(context, "umbral-noise", {
          numberOfInputs: 0,
          numberOfOutputs: 1,
          outputChannelCount: [1],
          processorOptions: { seed: genome.seed, color: genome.noiseColor, frames: Math.ceil(context.sampleRate * (genome.durationMs / 1000 + 0.08)) },
        });
        worklet.connect(envelope);
        this.rememberNode(worklet, genome.durationMs);
      } else {
        const source = this.createNoiseFallback(context, genome);
        source.connect(envelope);
        source.start(start);
        source.stop(end);
        this.rememberSource(source);
      }
      return;
    }

    const frequencies: Array<{ hz:number; pan:number; level:number }> = [];
    if (genome.beatMode === "binaural") {
      frequencies.push({ hz: genome.carrierHz - genome.beatHz / 2, pan: -0.68, level: 0.7 });
      frequencies.push({ hz: genome.carrierHz + genome.beatHz / 2, pan: 0.68, level: 0.7 });
    } else if (genome.beatMode === "monaural") {
      frequencies.push({ hz: genome.carrierHz, pan: 0, level: 0.62 });
      frequencies.push({ hz: genome.carrierHz + genome.beatHz, pan: 0, level: 0.62 });
    } else {
      for (let harmonic = 1; harmonic <= genome.harmonics; harmonic += 1) {
        frequencies.push({ hz: genome.carrierHz * harmonic, pan: 0, level: 0.78 / harmonic });
      }
    }

    frequencies.forEach((voice, index) => {
      const oscillator = context.createOscillator();
      const voiceGain = context.createGain();
      const voicePan = context.createStereoPanner();
      oscillator.type = genome.waveform === "triangle" ? "triangle" : "sine";
      oscillator.frequency.value = voice.hz;
      voiceGain.gain.value = voice.level;
      voicePan.pan.value = voice.pan;
      oscillator.connect(voiceGain).connect(voicePan).connect(envelope);
      if (index === 0 && genome.modHz > 0) {
        const lfo = context.createOscillator();
        const depth = context.createGain();
        lfo.frequency.value = genome.modHz;
        depth.gain.value = genome.carrierHz * 0.012;
        lfo.connect(depth).connect(oscillator.frequency);
        lfo.start(start);
        lfo.stop(end);
        this.rememberSource(lfo);
      }
      oscillator.start(start);
      oscillator.stop(end);
      this.rememberSource(oscillator);
    });
  }

  pause() { if (this.context?.state === "running") void this.context.suspend(); }
  resume() { if (this.context?.state === "suspended") void this.context.resume(); }

  stop() {
    const now = this.context?.currentTime;
    if (this.master && now !== undefined) {
      this.master.gain.cancelAndHoldAtTime(now);
      this.master.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
    }
    for (const source of this.activeSources) {
      try { if (now === undefined) source.stop(); else source.stop(now + 0.035); } catch { /* already stopped */ }
    }
    this.activeSources.clear();
    for (const timer of this.cleanupTimers) clearTimeout(timer);
    this.cleanupTimers.clear();
    for (const node of this.activeNodes) {
      const timer = setTimeout(() => { try { node.disconnect(); } catch { /* already disconnected */ } }, 40);
      this.cleanupTimers.add(timer);
    }
    this.activeNodes.clear();
  }

  async close() {
    this.stop();
    await this.context?.close();
    this.context = null;
    this.master = null;
    this.workletReady = false;
  }
}
