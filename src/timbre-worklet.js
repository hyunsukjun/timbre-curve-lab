class TimbreFilterProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.left = null;
    this.right = null;
    this.sampleRateSource = sampleRate;
    this.sourceFrame = 0;
    this.token = 0;
    this.tailFramesRemaining = 0;
    this.positionFramesUntilUpdate = 0;
    this.positionUpdateInterval = Math.max(1, Math.round(sampleRate / 30));
    this.lowPassCurve = [{ x: 0, y: 0.53 }, { x: 1, y: 0.53 }];
    this.highPassCurve = [{ x: 0, y: 0.38 }, { x: 1, y: 0.38 }];
    this.bandPassCenterCurve = [{ x: 0, y: 0.56 }, { x: 1, y: 0.56 }];
    this.bandPassWidthCurve = [{ x: 0, y: 0 }, { x: 1, y: 0 }];
    this.combDelayCurve = [{ x: 0, y: 0.52 }, { x: 1, y: 0.52 }];
    this.combFeedbackCurve = [{ x: 0, y: 0.526316 }, { x: 1, y: 0.526316 }];
    this.combMixCurve = [{ x: 0, y: 0.8 }, { x: 1, y: 0.8 }];
    this.flangerDelayCurve = [{ x: 0, y: 0.598105 }, { x: 1, y: 0.598105 }];
    this.flangerDepthCurve = [{ x: 0, y: 0.45 }, { x: 1, y: 0.45 }];
    this.flangerRateCurve = [{ x: 0, y: 0.52 }, { x: 1, y: 0.52 }];
    this.flangerFeedbackCurve = [{ x: 0, y: 0.529412 }, { x: 1, y: 0.529412 }];
    this.chorusDelayCurve = [{ x: 0, y: 0.32 }, { x: 1, y: 0.32 }];
    this.chorusDepthCurve = [{ x: 0, y: 0.4 }, { x: 1, y: 0.4 }];
    this.chorusRateCurve = [{ x: 0, y: 0.62134 }, { x: 1, y: 0.62134 }];
    this.chorusMixCurve = [{ x: 0, y: 0.45 }, { x: 1, y: 0.45 }];
    this.delayTimeCurve = [{ x: 0, y: 0.178571 }, { x: 1, y: 0.178571 }];
    this.delayFeedbackCurve = [{ x: 0, y: 0.411765 }, { x: 1, y: 0.411765 }];
    this.delayMixCurve = [{ x: 0, y: 0.35 }, { x: 1, y: 0.35 }];
    this.settings = {
      outputGain: 0.95,
      lowPassEnabled: false,
      highPassEnabled: false,
      bandPassEnabled: false,
      combEnabled: false,
      flangerEnabled: false,
      chorusEnabled: false,
      delayEnabled: false,
      chainOrder: [],
      playing: false
    };
    this.lowPassLeftState = { ic1: 0, ic2: 0 };
    this.lowPassRightState = { ic1: 0, ic2: 0 };
    this.highPassLeftState = { ic1: 0, ic2: 0 };
    this.highPassRightState = { ic1: 0, ic2: 0 };
    this.bandPassLeftState = { ic1: 0, ic2: 0 };
    this.bandPassRightState = { ic1: 0, ic2: 0 };
    const combBufferLength = Math.ceil(sampleRate * 0.12);
    this.combLeftState = { buffer: new Float32Array(combBufferLength), damp: 0, delayMs: 8, index: 0 };
    this.combRightState = { buffer: new Float32Array(combBufferLength), damp: 0, delayMs: 8, index: 0 };
    const modulationBufferLength = Math.ceil(sampleRate * 0.08);
    const delayBufferLength = Math.ceil(sampleRate * 1.6);
    this.flangerLeftState = { buffer: new Float32Array(modulationBufferLength), damp: 0, delayMs: 3, phase: 0, index: 0 };
    this.flangerRightState = { buffer: new Float32Array(modulationBufferLength), damp: 0, delayMs: 3, phase: 0.25, index: 0 };
    this.chorusLeftState = { buffer: new Float32Array(modulationBufferLength), damp: 0, delayMs: 18, phase: 0, index: 0 };
    this.chorusRightState = { buffer: new Float32Array(modulationBufferLength), damp: 0, delayMs: 18, phase: 0.5, index: 0 };
    this.delayLeftState = { buffer: new Float32Array(delayBufferLength), damp: 0, delayMs: 350, index: 0 };
    this.delayRightState = { buffer: new Float32Array(delayBufferLength), damp: 0, delayMs: 350, index: 0 };

    this.port.onmessage = (event) => {
      const data = event.data;
      if (data.type === "buffer") {
        this.left = data.left;
        this.right = data.right || data.left;
        this.sampleRateSource = data.sampleRate;
        this.sourceFrame = 0;
        this.tailFramesRemaining = 0;
        this.resetFilter();
        this.positionFramesUntilUpdate = 0;
      } else if (data.type === "curves") {
        this.lowPassCurve = data.lowPassCurve || this.lowPassCurve;
        this.highPassCurve = data.highPassCurve || this.highPassCurve;
        this.bandPassCenterCurve = data.bandPassCenterCurve || this.bandPassCenterCurve;
        this.bandPassWidthCurve = data.bandPassWidthCurve || this.bandPassWidthCurve;
        this.combDelayCurve = data.combDelayCurve || this.combDelayCurve;
        this.combFeedbackCurve = data.combFeedbackCurve || this.combFeedbackCurve;
        this.combMixCurve = data.combMixCurve || this.combMixCurve;
        this.flangerDelayCurve = data.flangerDelayCurve || this.flangerDelayCurve;
        this.flangerDepthCurve = data.flangerDepthCurve || this.flangerDepthCurve;
        this.flangerRateCurve = data.flangerRateCurve || this.flangerRateCurve;
        this.flangerFeedbackCurve = data.flangerFeedbackCurve || this.flangerFeedbackCurve;
        this.chorusDelayCurve = data.chorusDelayCurve || this.chorusDelayCurve;
        this.chorusDepthCurve = data.chorusDepthCurve || this.chorusDepthCurve;
        this.chorusRateCurve = data.chorusRateCurve || this.chorusRateCurve;
        this.chorusMixCurve = data.chorusMixCurve || this.chorusMixCurve;
        this.delayTimeCurve = data.delayTimeCurve || this.delayTimeCurve;
        this.delayFeedbackCurve = data.delayFeedbackCurve || this.delayFeedbackCurve;
        this.delayMixCurve = data.delayMixCurve || this.delayMixCurve;
      } else if (data.type === "settings") {
        const wasCombEnabled = this.settings.combEnabled;
        Object.assign(this.settings, data.settings);
        if (wasCombEnabled && !this.settings.combEnabled) {
          this.combLeftState.buffer.fill(0);
          this.combLeftState.damp = 0;
          this.combLeftState.delayMs = 8;
          this.combLeftState.index = 0;
          this.combRightState.buffer.fill(0);
          this.combRightState.damp = 0;
          this.combRightState.delayMs = 8;
          this.combRightState.index = 0;
        }
      } else if (data.type === "play") {
        this.token = data.token ?? this.token;
        if (this.left && this.sourceFrame >= this.left.length - 3) {
          this.sourceFrame = 0;
          this.resetFilter();
        }
        this.settings.playing = true;
        this.tailFramesRemaining = 0;
        this.positionFramesUntilUpdate = 0;
      } else if (data.type === "stop") {
        this.token = data.token ?? this.token;
        this.settings.playing = false;
        this.tailFramesRemaining = 0;
        if (data.reset) {
          this.sourceFrame = 0;
          this.resetFilter();
        }
        this.positionFramesUntilUpdate = 0;
        this.port.postMessage({ type: "stopped", seconds: this.sourceFrame / this.sampleRateSource, token: this.token });
      } else if (data.type === "seek") {
        this.token = data.token ?? this.token;
        if (this.left) {
          this.sourceFrame = Math.max(0, Math.min(this.left.length - 3, (data.seconds || 0) * this.sampleRateSource));
        }
        this.tailFramesRemaining = 0;
        this.resetFilter();
        this.positionFramesUntilUpdate = 0;
      }
    };
  }

  resetFilter() {
    this.lowPassLeftState.ic1 = 0;
    this.lowPassLeftState.ic2 = 0;
    this.lowPassRightState.ic1 = 0;
    this.lowPassRightState.ic2 = 0;
    this.highPassLeftState.ic1 = 0;
    this.highPassLeftState.ic2 = 0;
    this.highPassRightState.ic1 = 0;
    this.highPassRightState.ic2 = 0;
    this.bandPassLeftState.ic1 = 0;
    this.bandPassLeftState.ic2 = 0;
    this.bandPassRightState.ic1 = 0;
    this.bandPassRightState.ic2 = 0;
    this.combLeftState.buffer.fill(0);
    this.combLeftState.damp = 0;
    this.combLeftState.delayMs = 8;
    this.combLeftState.index = 0;
    this.combRightState.buffer.fill(0);
    this.combRightState.damp = 0;
    this.combRightState.delayMs = 8;
    this.combRightState.index = 0;
    this.resetDelayState(this.flangerLeftState, 3);
    this.resetDelayState(this.flangerRightState, 3);
    this.flangerRightState.phase = 0.25;
    this.resetDelayState(this.chorusLeftState, 18);
    this.resetDelayState(this.chorusRightState, 18);
    this.chorusRightState.phase = 0.5;
    this.resetDelayState(this.delayLeftState, 350);
    this.resetDelayState(this.delayRightState, 350);
  }

  resetDelayState(state, delayMs) {
    state.buffer.fill(0);
    state.damp = 0;
    state.delayMs = delayMs;
    state.index = 0;
    if (state.phase == null) state.phase = 0;
  }

  valueAt(curve, x) {
    if (!curve || curve.length === 0) return 0;
    if (x <= curve[0].x) return curve[0].y;
    for (let i = 1; i < curve.length; i += 1) {
      const a = curve[i - 1];
      const b = curve[i];
      if (x <= b.x) {
        const t = (x - a.x) / Math.max(1e-6, b.x - a.x);
        const eased = t * t * (3 - (2 * t));
        return a.y + ((b.y - a.y) * eased);
      }
    }
    return curve[curve.length - 1].y;
  }

  read(buffer, pos) {
    if (!buffer || buffer.length === 0) return 0;
    if (pos < 0 || pos >= buffer.length - 3) return 0;
    const i0 = Math.floor(pos);
    const frac = pos - i0;
    const x0 = buffer[i0];
    const x1 = buffer[i0 + 1];
    return x0 + ((x1 - x0) * frac);
  }

  cutoffFromNorm(y) {
    const minHz = 40;
    const maxHz = Math.min(18000, sampleRate * 0.45);
    const clamped = Math.max(0, Math.min(1, y));
    return minHz * Math.pow(maxHz / minHz, clamped);
  }

  qFromWidthNorm(y) {
    const clamped = Math.max(0, Math.min(1, y));
    return 0.5 * Math.pow(24, 1 - clamped);
  }

  combDelayMsFromNorm(y) {
    const minMs = 0.5;
    const maxMs = 100;
    const clamped = Math.max(0, Math.min(1, y));
    return minMs * Math.pow(maxMs / minMs, clamped);
  }

  combFeedbackFromNorm(y) {
    return Math.max(0, Math.min(1, y)) * 0.95;
  }

  combMixFromNorm(y) {
    return Math.max(0, Math.min(1, y));
  }

  flangerDelayMsFromNorm(y) {
    const minMs = 0.5;
    const maxMs = 10;
    const clamped = Math.max(0, Math.min(1, y));
    return minMs * Math.pow(maxMs / minMs, clamped);
  }

  flangerDepthMsFromNorm(y) {
    return Math.max(0, Math.min(1, y)) * 10;
  }

  flangerRateHzFromNorm(y) {
    const minHz = 0.02;
    const maxHz = 5;
    const clamped = Math.max(0, Math.min(1, y));
    return minHz * Math.pow(maxHz / minHz, clamped);
  }

  modulationFeedbackFromNorm(y) {
    return Math.max(0, Math.min(1, y)) * 0.85;
  }

  chorusDelayMsFromNorm(y) {
    return 10 + (Math.max(0, Math.min(1, y)) * 25);
  }

  chorusDepthMsFromNorm(y) {
    return Math.max(0, Math.min(1, y)) * 20;
  }

  chorusRateHzFromNorm(y) {
    const minHz = 0.02;
    const maxHz = 3;
    const clamped = Math.max(0, Math.min(1, y));
    return minHz * Math.pow(maxHz / minHz, clamped);
  }

  delayTimeMsFromNorm(y) {
    return 100 + (Math.max(0, Math.min(1, y)) * 1400);
  }

  maxCurveValue(curve) {
    if (!Array.isArray(curve) || curve.length === 0) return 0;
    return curve.reduce((maximum, point) => Math.max(maximum, point.y || 0), 0);
  }

  delayTailSeconds() {
    if (!this.orderedEffects().includes("delay")) return 0;
    const mix = this.combMixFromNorm(this.maxCurveValue(this.delayMixCurve));
    if (mix <= 0.001) return 0;
    const delaySeconds = this.delayTimeMsFromNorm(this.maxCurveValue(this.delayTimeCurve)) / 1000;
    const feedback = this.modulationFeedbackFromNorm(this.maxCurveValue(this.delayFeedbackCurve));
    const repeats = feedback > 0.001
      ? Math.max(1, Math.ceil(Math.log(0.001) / Math.log(feedback)))
      : 1;
    return Math.min(10, delaySeconds * repeats);
  }

  processLowPass(input, state, cutoff) {
    const safeCutoff = Math.max(10, Math.min(sampleRate * 0.45, cutoff));
    const q = 0.71;
    const g = Math.tan(Math.PI * safeCutoff / sampleRate);
    const k = 1 / q;
    const a1 = 1 / (1 + (g * (g + k)));
    const a2 = g * a1;
    const a3 = g * a2;
    const v3 = input - state.ic2;
    const v1 = (a1 * state.ic1) + (a2 * v3);
    const v2 = state.ic2 + (a2 * state.ic1) + (a3 * v3);
    state.ic1 = (2 * v1) - state.ic1;
    state.ic2 = (2 * v2) - state.ic2;
    return v2;
  }

  processHighPass(input, state, cutoff) {
    const safeCutoff = Math.max(10, Math.min(sampleRate * 0.45, cutoff));
    const q = 0.71;
    const g = Math.tan(Math.PI * safeCutoff / sampleRate);
    const k = 1 / q;
    const a1 = 1 / (1 + (g * (g + k)));
    const a2 = g * a1;
    const a3 = g * a2;
    const v3 = input - state.ic2;
    const v1 = (a1 * state.ic1) + (a2 * v3);
    const v2 = state.ic2 + (a2 * state.ic1) + (a3 * v3);
    const high = input - (k * v1) - v2;
    state.ic1 = (2 * v1) - state.ic1;
    state.ic2 = (2 * v2) - state.ic2;
    return high;
  }

  processBandPass(input, state, center, q) {
    const safeCenter = Math.max(10, Math.min(sampleRate * 0.45, center));
    const safeQ = Math.max(0.5, Math.min(12, q));
    const g = Math.tan(Math.PI * safeCenter / sampleRate);
    const k = 1 / safeQ;
    const a1 = 1 / (1 + (g * (g + k)));
    const a2 = g * a1;
    const a3 = g * a2;
    const v3 = input - state.ic2;
    const v1 = (a1 * state.ic1) + (a2 * v3);
    const v2 = state.ic2 + (a2 * state.ic1) + (a3 * v3);
    state.ic1 = (2 * v1) - state.ic1;
    state.ic2 = (2 * v2) - state.ic2;
    return v1;
  }

  processComb(input, state, delayMs, feedback, mix) {
    const buffer = state.buffer;
    const length = buffer.length;
    const targetDelayMs = Math.max(0.5, Math.min(100, delayMs));
    // Smooth delay movement so drawn curves do not create zipper-like clicks.
    state.delayMs += (targetDelayMs - state.delayMs) * 0.0025;
    const delaySamples = state.delayMs * sampleRate / 1000;
    let readPos = state.index - delaySamples;
    while (readPos < 0) readPos += length;
    const i0 = Math.floor(readPos) % length;
    const i1 = (i0 + 1) % length;
    const frac = readPos - Math.floor(readPos);
    const delayed = buffer[i0] + ((buffer[i1] - buffer[i0]) * frac);
    const safeFeedback = Math.max(0, Math.min(0.95, feedback));
    const safeMix = Math.max(0, Math.min(1, mix));
    // A tiny internal damping keeps feedback musical instead of brittle.
    state.damp += (delayed - state.damp) * 0.22;
    buffer[state.index] = Math.max(-1.5, Math.min(1.5, input + (state.damp * safeFeedback)));
    state.index = (state.index + 1) % length;
    const combed = (input + delayed) * 0.5;
    return (input * (1 - safeMix)) + (combed * safeMix);
  }

  readDelayBuffer(state, delayMs) {
    const buffer = state.buffer;
    const length = buffer.length;
    const safeDelayMs = Math.max(0.25, Math.min((length / sampleRate) * 1000 - 1, delayMs));
    const delaySamples = safeDelayMs * sampleRate / 1000;
    let readPos = state.index - delaySamples;
    while (readPos < 0) readPos += length;
    const i0 = Math.floor(readPos) % length;
    const i1 = (i0 + 1) % length;
    const frac = readPos - Math.floor(readPos);
    return buffer[i0] + ((buffer[i1] - buffer[i0]) * frac);
  }

  processFlanger(input, state, delayMs, depthMs, rateHz, feedback) {
    state.delayMs += (Math.max(0.5, Math.min(10, delayMs)) - state.delayMs) * 0.0015;
    const lfo = 0.5 + (0.5 * Math.sin(state.phase * Math.PI * 2));
    const movingDelay = Math.max(0.25, state.delayMs + ((lfo - 0.5) * 2 * Math.max(0, Math.min(10, depthMs))));
    const delayed = this.readDelayBuffer(state, movingDelay);
    const safeFeedback = Math.max(0, Math.min(0.85, feedback));
    state.damp += (delayed - state.damp) * 0.35;
    state.buffer[state.index] = Math.max(-1.35, Math.min(1.35, input + (state.damp * safeFeedback)));
    state.index = (state.index + 1) % state.buffer.length;
    state.phase = (state.phase + (Math.max(0.02, Math.min(5, rateHz)) / sampleRate)) % 1;
    return (input * 0.46) + (delayed * 0.54);
  }

  processChorus(input, state, delayMs, depthMs, rateHz, mix) {
    state.delayMs += (Math.max(10, Math.min(35, delayMs)) - state.delayMs) * 0.0015;
    const lfo = 0.5 + (0.5 * Math.sin(state.phase * Math.PI * 2));
    const movingDelay = Math.max(5, state.delayMs + ((lfo - 0.5) * 2 * Math.max(0, Math.min(20, depthMs))));
    const delayed = this.readDelayBuffer(state, movingDelay);
    state.buffer[state.index] = input;
    state.index = (state.index + 1) % state.buffer.length;
    state.phase = (state.phase + (Math.max(0.02, Math.min(3, rateHz)) / sampleRate)) % 1;
    const safeMix = Math.max(0, Math.min(1, mix));
    return (input * (1 - safeMix)) + (delayed * safeMix);
  }

  processDelay(input, state, delayMs, feedback, mix) {
    state.delayMs += (Math.max(100, Math.min(1500, delayMs)) - state.delayMs) * 0.0008;
    const delayed = this.readDelayBuffer(state, state.delayMs);
    const safeFeedback = Math.max(0, Math.min(0.85, feedback));
    // Fixed repeat damping keeps echoes controlled without adding a fourth student-facing parameter.
    state.damp += (delayed - state.damp) * 0.22;
    state.buffer[state.index] = Math.max(-1.25, Math.min(1.25, input + (state.damp * safeFeedback)));
    state.index = (state.index + 1) % state.buffer.length;
    const safeMix = Math.max(0, Math.min(1, mix));
    return (input * (1 - safeMix)) + (delayed * safeMix);
  }

  orderedEffects() {
    const order = Array.isArray(this.settings.chainOrder) ? this.settings.chainOrder : [];
    return order.filter((name) => {
      if (name === "lowpass") return this.settings.lowPassEnabled;
      if (name === "highpass") return this.settings.highPassEnabled;
      if (name === "bandpass") return this.settings.bandPassEnabled;
      if (name === "comb") return this.settings.combEnabled;
      if (name === "flanger") return this.settings.flangerEnabled;
      if (name === "chorus") return this.settings.chorusEnabled;
      if (name === "delay") return this.settings.delayEnabled;
      return false;
    });
  }

  resetInactiveStates(order) {
    if (!order.includes("lowpass")) {
      this.lowPassLeftState.ic1 = 0;
      this.lowPassLeftState.ic2 = 0;
      this.lowPassRightState.ic1 = 0;
      this.lowPassRightState.ic2 = 0;
    }
    if (!order.includes("highpass")) {
      this.highPassLeftState.ic1 = 0;
      this.highPassLeftState.ic2 = 0;
      this.highPassRightState.ic1 = 0;
      this.highPassRightState.ic2 = 0;
    }
    if (!order.includes("bandpass")) {
      this.bandPassLeftState.ic1 = 0;
      this.bandPassLeftState.ic2 = 0;
      this.bandPassRightState.ic1 = 0;
      this.bandPassRightState.ic2 = 0;
    }
    if (!order.includes("flanger")) {
      this.resetDelayState(this.flangerLeftState, 3);
      this.resetDelayState(this.flangerRightState, 3);
      this.flangerRightState.phase = 0.25;
    }
    if (!order.includes("chorus")) {
      this.resetDelayState(this.chorusLeftState, 18);
      this.resetDelayState(this.chorusRightState, 18);
      this.chorusRightState.phase = 0.5;
    }
    if (!order.includes("delay")) {
      this.resetDelayState(this.delayLeftState, 350);
      this.resetDelayState(this.delayRightState, 350);
    }
  }

  limitSample(input) {
    const threshold = 0.92;
    const clamped = Math.max(-2, Math.min(2, input));
    const abs = Math.abs(clamped);
    if (abs <= threshold) return clamped;
    const over = abs - threshold;
    const compressed = threshold + (over / (1 + (over * 4)));
    return Math.sign(clamped) * Math.min(0.995, compressed);
  }

  process(_, outputs) {
    const out = outputs[0];
    const outL = out[0];
    const outR = out[1] || out[0];

    for (let i = 0; i < outL.length; i += 1) {
      let l = 0;
      let r = 0;

      if (this.left && this.settings.playing) {
        const sourceEndFrame = Math.max(0, this.left.length - 3);
        const sourceIsActive = this.sourceFrame < sourceEndFrame;
        const norm = sourceIsActive && this.left.length > 1
          ? Math.min(1, this.sourceFrame / (this.left.length - 1))
          : 1;
        const lowPassCutoff = this.cutoffFromNorm(this.valueAt(this.lowPassCurve, norm));
        const highPassCutoff = this.cutoffFromNorm(this.valueAt(this.highPassCurve, norm));
        const bandPassCenter = this.cutoffFromNorm(this.valueAt(this.bandPassCenterCurve, norm));
        const bandPassWidth = this.valueAt(this.bandPassWidthCurve, norm);
        const bandPassQ = this.qFromWidthNorm(bandPassWidth);
        const combDelayMs = this.combDelayMsFromNorm(this.valueAt(this.combDelayCurve, norm));
        const combFeedback = this.combFeedbackFromNorm(this.valueAt(this.combFeedbackCurve, norm));
        const combMix = this.combMixFromNorm(this.valueAt(this.combMixCurve, norm));
        const flangerDelayMs = this.flangerDelayMsFromNorm(this.valueAt(this.flangerDelayCurve, norm));
        const flangerDepthMs = this.flangerDepthMsFromNorm(this.valueAt(this.flangerDepthCurve, norm));
        const flangerRateHz = this.flangerRateHzFromNorm(this.valueAt(this.flangerRateCurve, norm));
        const flangerFeedback = this.modulationFeedbackFromNorm(this.valueAt(this.flangerFeedbackCurve, norm));
        const chorusDelayMs = this.chorusDelayMsFromNorm(this.valueAt(this.chorusDelayCurve, norm));
        const chorusDepthMs = this.chorusDepthMsFromNorm(this.valueAt(this.chorusDepthCurve, norm));
        const chorusRateHz = this.chorusRateHzFromNorm(this.valueAt(this.chorusRateCurve, norm));
        const chorusMix = this.combMixFromNorm(this.valueAt(this.chorusMixCurve, norm));
        const delayTimeMs = this.delayTimeMsFromNorm(this.valueAt(this.delayTimeCurve, norm));
        const delayFeedback = this.modulationFeedbackFromNorm(this.valueAt(this.delayFeedbackCurve, norm));
        const delayMix = this.combMixFromNorm(this.valueAt(this.delayMixCurve, norm));
        const order = this.orderedEffects();
        let dryL = sourceIsActive ? this.read(this.left, this.sourceFrame) : 0;
        let dryR = sourceIsActive ? this.read(this.right, this.sourceFrame) : 0;
        this.resetInactiveStates(order);
        for (const effectName of order) {
          if (effectName === "lowpass") {
            dryL = this.processLowPass(dryL, this.lowPassLeftState, lowPassCutoff);
            dryR = this.processLowPass(dryR, this.lowPassRightState, lowPassCutoff);
          } else if (effectName === "highpass") {
            dryL = this.processHighPass(dryL, this.highPassLeftState, highPassCutoff);
            dryR = this.processHighPass(dryR, this.highPassRightState, highPassCutoff);
          } else if (effectName === "bandpass" && bandPassWidth < 0.995) {
            dryL = this.processBandPass(dryL, this.bandPassLeftState, bandPassCenter, bandPassQ);
            dryR = this.processBandPass(dryR, this.bandPassRightState, bandPassCenter, bandPassQ);
          } else if (effectName === "comb") {
            dryL = this.processComb(dryL, this.combLeftState, combDelayMs, combFeedback, combMix);
            dryR = this.processComb(dryR, this.combRightState, combDelayMs, combFeedback, combMix);
          } else if (effectName === "flanger") {
            dryL = this.processFlanger(dryL, this.flangerLeftState, flangerDelayMs, flangerDepthMs, flangerRateHz, flangerFeedback);
            dryR = this.processFlanger(dryR, this.flangerRightState, flangerDelayMs, flangerDepthMs, flangerRateHz, flangerFeedback);
          } else if (effectName === "chorus") {
            dryL = this.processChorus(dryL, this.chorusLeftState, chorusDelayMs, chorusDepthMs, chorusRateHz, chorusMix);
            dryR = this.processChorus(dryR, this.chorusRightState, chorusDelayMs, chorusDepthMs, chorusRateHz, chorusMix);
          } else if (effectName === "delay") {
            dryL = this.processDelay(dryL, this.delayLeftState, delayTimeMs, delayFeedback, delayMix);
            dryR = this.processDelay(dryR, this.delayRightState, delayTimeMs, delayFeedback, delayMix);
          }
        }
        l = dryL;
        r = dryR;
        l *= this.settings.outputGain;
        r *= this.settings.outputGain;

        if (sourceIsActive) {
          this.sourceFrame += this.sampleRateSource / sampleRate;
          if (this.sourceFrame >= sourceEndFrame) {
            this.sourceFrame = sourceEndFrame;
            this.tailFramesRemaining = Math.round(this.delayTailSeconds() * sampleRate);
            if (this.tailFramesRemaining <= 0) {
              this.settings.playing = false;
              this.port.postMessage({ type: "ended", token: this.token });
            }
          }
        } else if (this.tailFramesRemaining > 0) {
          this.tailFramesRemaining -= 1;
          if (this.tailFramesRemaining <= 0) {
            this.settings.playing = false;
            this.port.postMessage({ type: "ended", token: this.token });
          }
        } else {
          this.settings.playing = false;
          this.port.postMessage({ type: "ended", token: this.token });
        }

        if (this.positionFramesUntilUpdate <= 0) {
          this.port.postMessage({
            type: "position",
            seconds: this.sourceFrame / this.sampleRateSource,
            lowPassCutoff,
            highPassCutoff,
            bandPassCenter,
            bandPassQ,
            bandPassWidth,
            combDelayMs,
            combFeedback,
            combMix,
            flangerDelayMs,
            flangerDepthMs,
            flangerRateHz,
            flangerFeedback,
            chorusDelayMs,
            chorusDepthMs,
            chorusRateHz,
            chorusMix,
            delayTimeMs,
            delayFeedback,
            delayMix,
            token: this.token
          });
          this.positionFramesUntilUpdate = this.positionUpdateInterval;
        }
        this.positionFramesUntilUpdate -= 1;
      }

      outL[i] = this.limitSample(l);
      outR[i] = this.limitSample(r);
    }

    return true;
  }
}

registerProcessor("timbre-filter-processor", TimbreFilterProcessor);
