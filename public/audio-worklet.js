class UmbralNoiseProcessor extends AudioWorkletProcessor {
  constructor(options) { super(); this.state = (options.processorOptions?.seed || 1) >>> 0; }
  process(_inputs, outputs) { const output = outputs[0]; for (const channel of output) for (let i = 0; i < channel.length; i += 1) { this.state += 0x6D2B79F5; let t = this.state; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); channel[i] = (((t ^ (t >>> 14)) >>> 0) / 2147483648 - 1) * 0.18; } return true; }
}
registerProcessor("umbral-noise", UmbralNoiseProcessor);
