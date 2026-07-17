class UmbralNoiseProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    const config = options.processorOptions || {};
    this.state = (config.seed || 1) >>> 0;
    this.color = config.color || "white";
    this.frames = config.frames || sampleRate * 2;
    this.brown = 0;
    this.pink = [0,0,0,0,0,0,0];
  }
  random() {
    this.state += 0x6D2B79F5;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 2147483648 - 1;
  }
  sample() {
    const white = this.random();
    if (this.color === "white") return white * 0.34;
    if (this.color === "brown") {
      this.brown = (this.brown + 0.02 * white) / 1.02;
      return Math.max(-1, Math.min(1, this.brown * 3.2)) * 0.34;
    }
    const p = this.pink;
    p[0]=0.99886*p[0]+white*0.0555179; p[1]=0.99332*p[1]+white*0.0750759;
    p[2]=0.969*p[2]+white*0.153852; p[3]=0.8665*p[3]+white*0.3104856;
    p[4]=0.55*p[4]+white*0.5329522; p[5]=-0.7616*p[5]-white*0.016898;
    const value=p[0]+p[1]+p[2]+p[3]+p[4]+p[5]+p[6]+white*0.5362;
    p[6]=white*0.115926;
    return Math.max(-1,Math.min(1,value*0.11))*0.34;
  }
  process(_inputs, outputs) {
    const output = outputs[0];
    for (let index=0; index<output[0].length; index+=1) {
      if (this.frames-- <= 0) return false;
      const value = this.sample();
      for (const channel of output) channel[index] = value;
    }
    return true;
  }
}
registerProcessor("umbral-noise", UmbralNoiseProcessor);
