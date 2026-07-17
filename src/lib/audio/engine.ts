import { stimulusGenomeSchema, type StimulusGenome } from "@/src/lib/stimulus-genome";

export class UmbralAudioEngine {
  private readonly masterLevel = 0.18;
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private active = new Set<AudioScheduledSourceNode>();

  private async setup() {
    if (this.context) return;
    this.context = new AudioContext({ latencyHint: "interactive" });
    const limiter = this.context.createDynamicsCompressor();
    limiter.threshold.value = -18; limiter.knee.value = 8; limiter.ratio.value = 12; limiter.attack.value = 0.004; limiter.release.value = 0.18;
    this.master = this.context.createGain();
    this.master.gain.value = 0.0001;
    this.master.connect(limiter).connect(this.context.destination);
    try { await this.context.audioWorklet.addModule("/audio-worklet.js"); } catch { /* oscillator fallback stays available */ }
  }

  async play(input: StimulusGenome) {
    const genome = stimulusGenomeSchema.parse(input);
    await this.setup();
    const context = this.context;
    const master = this.master;
    if (!context || !master) return;
    await context.resume();
    this.stop();
    if (genome.sham) return;
    const start = context.currentTime + 0.06;
    const end = start + genome.durationMs / 1000;
    master.gain.setValueAtTime(0.0001, start);
    master.gain.exponentialRampToValueAtTime(this.masterLevel, start + 0.04);
    const envelope = context.createGain();
    const pan = context.createStereoPanner();
    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.exponentialRampToValueAtTime(genome.gain, start + 0.04);
    envelope.gain.setValueAtTime(genome.gain, end - 0.06);
    envelope.gain.exponentialRampToValueAtTime(0.0001, end);
    pan.pan.value = genome.pan;
    envelope.connect(pan).connect(master);
    const oscillator = context.createOscillator();
    oscillator.type = genome.waveform === "noise" ? "sine" : genome.waveform;
    oscillator.frequency.value = genome.carrierHz;
    if (genome.modHz > 0) {
      const lfo = context.createOscillator(); const depth = context.createGain();
      lfo.frequency.value = genome.modHz; depth.gain.value = genome.carrierHz * 0.018;
      lfo.connect(depth).connect(oscillator.frequency); lfo.start(start); lfo.stop(end); this.active.add(lfo);
    }
    oscillator.connect(envelope); oscillator.start(start); oscillator.stop(end); this.active.add(oscillator);
    oscillator.onended = () => this.active.delete(oscillator);
  }

  pause() { if (this.context?.state === "running") void this.context.suspend(); }
  resume() { if (this.context?.state === "suspended") void this.context.resume(); }
  stop() {
    const now = this.context?.currentTime;
    if (this.master && now !== undefined) {
      this.master.gain.cancelAndHoldAtTime(now);
      this.master.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
    }
    for (const source of this.active) {
      try { source.stop(now === undefined ? undefined : now + 0.035); } catch { /* already stopped */ }
    }
    this.active.clear();
  }
  async close() { this.stop(); await this.context?.close(); this.context = null; this.master = null; }
}
