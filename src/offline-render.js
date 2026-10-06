import { encodeWav } from "./wav-encoder.js?v=20261006-chunk-01";
import { prepareWavChannels } from "./wav-output.js?v=20261006-48k-01";
function valueAt(curve, x) {
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

function cutoffFromNorm(y, sampleRate) {
  const minHz = 40;
  const maxHz = Math.min(18000, sampleRate * 0.45);
  const clamped = Math.max(0, Math.min(1, y));
  return minHz * Math.pow(maxHz / minHz, clamped);
}

function qFromWidthNorm(y) {
  const clamped = Math.max(0, Math.min(1, y));
  return 0.5 * Math.pow(24, 1 - clamped);
}

function combDelayMsFromNorm(y) {
  const minMs = 0.5;
  const maxMs = 100;
  const clamped = Math.max(0, Math.min(1, y));
  return minMs * Math.pow(maxMs / minMs, clamped);
}

function combFeedbackFromNorm(y) {
  return Math.max(0, Math.min(1, y)) * 0.95;
}

function combMixFromNorm(y) {
  return Math.max(0, Math.min(1, y));
}

function flangerDelayMsFromNorm(y) {
  const minMs = 0.5;
  const maxMs = 10;
  const clamped = Math.max(0, Math.min(1, y));
  return minMs * Math.pow(maxMs / minMs, clamped);
}

function flangerDepthMsFromNorm(y) {
  return Math.max(0, Math.min(1, y)) * 10;
}

function flangerRateHzFromNorm(y) {
  const minHz = 0.02;
  const maxHz = 5;
  const clamped = Math.max(0, Math.min(1, y));
  return minHz * Math.pow(maxHz / minHz, clamped);
}

function modulationFeedbackFromNorm(y) {
  return Math.max(0, Math.min(1, y)) * 0.85;
}

function chorusDelayMsFromNorm(y) {
  return 10 + (Math.max(0, Math.min(1, y)) * 25);
}

function chorusDepthMsFromNorm(y) {
  return Math.max(0, Math.min(1, y)) * 20;
}

function chorusRateHzFromNorm(y) {
  const minHz = 0.02;
  const maxHz = 3;
  const clamped = Math.max(0, Math.min(1, y));
  return minHz * Math.pow(maxHz / minHz, clamped);
}

function delayTimeMsFromNorm(y) {
  return 100 + (Math.max(0, Math.min(1, y)) * 1400);
}

function maxCurveValue(curve) {
  if (!Array.isArray(curve) || curve.length === 0) return 0;
  return curve.reduce((maximum, point) => Math.max(maximum, point.y || 0), 0);
}

function delayTailSeconds(curves, settings) {
  const delayIsActive = settings.delayEnabled && settings.chainOrder?.includes("delay");
  if (!delayIsActive) return 0;
  const mix = combMixFromNorm(maxCurveValue(curves.delayMix));
  if (mix <= 0.001) return 0;
  const delaySeconds = delayTimeMsFromNorm(maxCurveValue(curves.delayTime)) / 1000;
  const feedback = modulationFeedbackFromNorm(maxCurveValue(curves.delayFeedback));
  const repeats = feedback > 0.001
    ? Math.max(1, Math.ceil(Math.log(0.001) / Math.log(feedback)))
    : 1;
  return Math.min(10, delaySeconds * repeats);
}

function processLowPass(input, state, cutoff, sampleRate) {
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

function processHighPass(input, state, cutoff, sampleRate) {
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

function processBandPass(input, state, center, q, sampleRate) {
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

function processComb(input, state, delayMs, feedback, mix, sampleRate) {
  const buffer = state.buffer;
  const length = buffer.length;
  const targetDelayMs = Math.max(0.5, Math.min(100, delayMs));
  // Smooth delay movement so exported WAVs match the realtime engine.
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

function readDelayBuffer(state, delayMs, sampleRate) {
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

function processFlanger(input, state, delayMs, depthMs, rateHz, feedback, sampleRate) {
  state.delayMs += (Math.max(0.5, Math.min(10, delayMs)) - state.delayMs) * 0.0015;
  const lfo = 0.5 + (0.5 * Math.sin(state.phase * Math.PI * 2));
  const movingDelay = Math.max(0.25, state.delayMs + ((lfo - 0.5) * 2 * Math.max(0, Math.min(10, depthMs))));
  const delayed = readDelayBuffer(state, movingDelay, sampleRate);
  const safeFeedback = Math.max(0, Math.min(0.85, feedback));
  state.damp += (delayed - state.damp) * 0.35;
  state.buffer[state.index] = Math.max(-1.35, Math.min(1.35, input + (state.damp * safeFeedback)));
  state.index = (state.index + 1) % state.buffer.length;
  state.phase = (state.phase + (Math.max(0.02, Math.min(5, rateHz)) / sampleRate)) % 1;
  return (input * 0.46) + (delayed * 0.54);
}

function processChorus(input, state, delayMs, depthMs, rateHz, mix, sampleRate) {
  state.delayMs += (Math.max(10, Math.min(35, delayMs)) - state.delayMs) * 0.0015;
  const lfo = 0.5 + (0.5 * Math.sin(state.phase * Math.PI * 2));
  const movingDelay = Math.max(5, state.delayMs + ((lfo - 0.5) * 2 * Math.max(0, Math.min(20, depthMs))));
  const delayed = readDelayBuffer(state, movingDelay, sampleRate);
  state.buffer[state.index] = input;
  state.index = (state.index + 1) % state.buffer.length;
  state.phase = (state.phase + (Math.max(0.02, Math.min(3, rateHz)) / sampleRate)) % 1;
  const safeMix = Math.max(0, Math.min(1, mix));
  return (input * (1 - safeMix)) + (delayed * safeMix);
}

function processDelay(input, state, delayMs, feedback, mix, sampleRate) {
  state.delayMs += (Math.max(100, Math.min(1500, delayMs)) - state.delayMs) * 0.0008;
  const delayed = readDelayBuffer(state, state.delayMs, sampleRate);
  const safeFeedback = Math.max(0, Math.min(0.85, feedback));
  // Keep exported echoes controlled with the same hidden damping used in realtime playback.
  state.damp += (delayed - state.damp) * 0.22;
  state.buffer[state.index] = Math.max(-1.25, Math.min(1.25, input + (state.damp * safeFeedback)));
  state.index = (state.index + 1) % state.buffer.length;
  const safeMix = Math.max(0, Math.min(1, mix));
  return (input * (1 - safeMix)) + (delayed * safeMix);
}

function limitSample(input) {
  const threshold = 0.92;
  const clamped = Math.max(-2, Math.min(2, input));
  const abs = Math.abs(clamped);
  if (abs <= threshold) return clamped;
  const over = abs - threshold;
  const compressed = threshold + (over / (1 + (over * 4)));
  return Math.sign(clamped) * Math.min(0.995, compressed);
}

function orderedEffects(settings) {
  const order = Array.isArray(settings.chainOrder) ? settings.chainOrder : [];
  return order.filter((name) => {
    if (name === "lowpass") return settings.lowPassEnabled;
    if (name === "highpass") return settings.highPassEnabled;
    if (name === "bandpass") return settings.bandPassEnabled;
    if (name === "comb") return settings.combEnabled;
    if (name === "flanger") return settings.flangerEnabled;
    if (name === "chorus") return settings.chorusEnabled;
    if (name === "delay") return settings.delayEnabled;
    return false;
  });
}


export async function renderOffline({ audioBuffer, curves, settings, signal, onProgress }) {
  if (signal?.aborted) throw new DOMException("Render cancelled", "AbortError");
  const sampleRate = audioBuffer.sampleRate;
  const maxDuration = 180;
  if (audioBuffer.duration > maxDuration) {
    const error = new RangeError("Export exceeds 180 s source limit; no file saved.");
    error.code = "EXPORT_DURATION_LIMIT";
    throw error;
  }
  const left = audioBuffer.getChannelData(0);
  const right = audioBuffer.numberOfChannels > 1 ? audioBuffer.getChannelData(1) : left;
  const outputDuration = audioBuffer.duration;
  const sourceLength = Math.max(1, Math.ceil(outputDuration * sampleRate));
  const tailDuration = delayTailSeconds(curves, settings);
  const outLength = sourceLength + Math.round(tailDuration * sampleRate);
  const outL = new Float32Array(outLength);
  const outR = new Float32Array(outLength);
  const lowPassLeftState = { ic1: 0, ic2: 0 };
  const lowPassRightState = { ic1: 0, ic2: 0 };
  const highPassLeftState = { ic1: 0, ic2: 0 };
  const highPassRightState = { ic1: 0, ic2: 0 };
  const bandPassLeftState = { ic1: 0, ic2: 0 };
  const bandPassRightState = { ic1: 0, ic2: 0 };
  const combBufferLength = Math.ceil(sampleRate * 0.12);
  const combLeftState = { buffer: new Float32Array(combBufferLength), damp: 0, delayMs: 8, index: 0 };
  const combRightState = { buffer: new Float32Array(combBufferLength), damp: 0, delayMs: 8, index: 0 };
  const modulationBufferLength = Math.ceil(sampleRate * 0.08);
  const delayBufferLength = Math.ceil(sampleRate * 1.6);
  const flangerLeftState = { buffer: new Float32Array(modulationBufferLength), damp: 0, delayMs: 3, phase: 0, index: 0 };
  const flangerRightState = { buffer: new Float32Array(modulationBufferLength), damp: 0, delayMs: 3, phase: 0.25, index: 0 };
  const chorusLeftState = { buffer: new Float32Array(modulationBufferLength), damp: 0, delayMs: 18, phase: 0, index: 0 };
  const chorusRightState = { buffer: new Float32Array(modulationBufferLength), damp: 0, delayMs: 18, phase: 0.5, index: 0 };
  const delayLeftState = { buffer: new Float32Array(delayBufferLength), damp: 0, delayMs: 350, index: 0 };
  const delayRightState = { buffer: new Float32Array(delayBufferLength), damp: 0, delayMs: 350, index: 0 };
  const gain = settings.outputGain ?? 0.95;
  const lowPassEnabled = settings.lowPassEnabled ?? false;
  const highPassEnabled = settings.highPassEnabled ?? false;
  const bandPassEnabled = settings.bandPassEnabled ?? false;
  const combEnabled = settings.combEnabled ?? false;
  const flangerEnabled = settings.flangerEnabled ?? false;
  const chorusEnabled = settings.chorusEnabled ?? false;
  const delayEnabled = settings.delayEnabled ?? false;
  const effectOrder = orderedEffects({
    ...settings,
    lowPassEnabled,
    highPassEnabled,
    bandPassEnabled,
    combEnabled,
    flangerEnabled,
    chorusEnabled,
    delayEnabled
  });
  let peak = 0;
  let lastProgress = 0;
  let lastYield = performance.now();

  for (let i = 0; i < outLength; i += 1) {
    if (signal?.aborted) {
      throw new DOMException("Render cancelled", "AbortError");
    }

    const norm = sourceLength > 1 ? Math.min(1, i / (sourceLength - 1)) : 1;
    const lowPassCutoff = cutoffFromNorm(valueAt(curves.lowpass, norm), sampleRate);
    const highPassCutoff = cutoffFromNorm(valueAt(curves.highpass, norm), sampleRate);
    const bandPassCenter = cutoffFromNorm(valueAt(curves.bandpassCenter, norm), sampleRate);
    const bandPassWidth = valueAt(curves.bandpassWidth, norm);
    const bandPassQ = qFromWidthNorm(bandPassWidth);
    const combDelayMs = combDelayMsFromNorm(valueAt(curves.combDelay, norm));
    const combFeedback = combFeedbackFromNorm(valueAt(curves.combFeedback, norm));
    const combMix = combMixFromNorm(valueAt(curves.combMix, norm));
    const flangerDelayMs = flangerDelayMsFromNorm(valueAt(curves.flangerDelay, norm));
    const flangerDepthMs = flangerDepthMsFromNorm(valueAt(curves.flangerDepth, norm));
    const flangerRateHz = flangerRateHzFromNorm(valueAt(curves.flangerRate, norm));
    const flangerFeedback = modulationFeedbackFromNorm(valueAt(curves.flangerFeedback, norm));
    const chorusDelayMs = chorusDelayMsFromNorm(valueAt(curves.chorusDelay, norm));
    const chorusDepthMs = chorusDepthMsFromNorm(valueAt(curves.chorusDepth, norm));
    const chorusRateHz = chorusRateHzFromNorm(valueAt(curves.chorusRate, norm));
    const chorusMix = combMixFromNorm(valueAt(curves.chorusMix, norm));
    const delayTimeMs = delayTimeMsFromNorm(valueAt(curves.delayTime, norm));
    const delayFeedback = modulationFeedbackFromNorm(valueAt(curves.delayFeedback, norm));
    const delayMix = combMixFromNorm(valueAt(curves.delayMix, norm));
    let renderedL = i < sourceLength ? (left[i] || 0) : 0;
    let renderedR = i < sourceLength ? (right[i] || 0) : 0;
    for (const effectName of effectOrder) {
      if (effectName === "lowpass") {
        renderedL = processLowPass(renderedL, lowPassLeftState, lowPassCutoff, sampleRate);
        renderedR = processLowPass(renderedR, lowPassRightState, lowPassCutoff, sampleRate);
      } else if (effectName === "highpass") {
        renderedL = processHighPass(renderedL, highPassLeftState, highPassCutoff, sampleRate);
        renderedR = processHighPass(renderedR, highPassRightState, highPassCutoff, sampleRate);
      } else if (effectName === "bandpass" && bandPassWidth < 0.995) {
        renderedL = processBandPass(renderedL, bandPassLeftState, bandPassCenter, bandPassQ, sampleRate);
        renderedR = processBandPass(renderedR, bandPassRightState, bandPassCenter, bandPassQ, sampleRate);
      } else if (effectName === "comb") {
        renderedL = processComb(renderedL, combLeftState, combDelayMs, combFeedback, combMix, sampleRate);
        renderedR = processComb(renderedR, combRightState, combDelayMs, combFeedback, combMix, sampleRate);
      } else if (effectName === "flanger") {
        renderedL = processFlanger(renderedL, flangerLeftState, flangerDelayMs, flangerDepthMs, flangerRateHz, flangerFeedback, sampleRate);
        renderedR = processFlanger(renderedR, flangerRightState, flangerDelayMs, flangerDepthMs, flangerRateHz, flangerFeedback, sampleRate);
      } else if (effectName === "chorus") {
        renderedL = processChorus(renderedL, chorusLeftState, chorusDelayMs, chorusDepthMs, chorusRateHz, chorusMix, sampleRate);
        renderedR = processChorus(renderedR, chorusRightState, chorusDelayMs, chorusDepthMs, chorusRateHz, chorusMix, sampleRate);
      } else if (effectName === "delay") {
        renderedL = processDelay(renderedL, delayLeftState, delayTimeMs, delayFeedback, delayMix, sampleRate);
        renderedR = processDelay(renderedR, delayRightState, delayTimeMs, delayFeedback, delayMix, sampleRate);
      }
    }
    renderedL = limitSample(renderedL * gain);
    renderedR = limitSample(renderedR * gain);
    outL[i] = renderedL;
    outR[i] = renderedR;
    peak = Math.max(peak, Math.abs(renderedL), Math.abs(renderedR));

    const progress = i / outLength;
    const now = performance.now();
    if (progress - lastProgress > 0.01 || now - lastYield > 60) {
      lastProgress = progress;
      onProgress?.(progress);
      lastYield = now;
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  const normalise = peak > 0 ? Math.min(1.0, 0.98 / peak) : 1;
  if (normalise < 1) {
    for (let i = 0; i < outLength; i += 1) {
      outL[i] *= normalise;
      outR[i] *= normalise;
    }
  }

  const output = await prepareWavChannels(outL, outR, sampleRate, signal);
  const blob = await encodeWav(output.left, output.right, output.sampleRate, signal);
  onProgress?.(1);
  return {
    ...output,
    duration: output.left.length / output.sampleRate,
    blob,
    truncated: audioBuffer.duration > maxDuration
  };
}
