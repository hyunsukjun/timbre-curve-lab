import { OutputMeterAnalyzer } from "./output-meter.js?v=20260930-02";

const fileInput = document.getElementById("fileInput");
const fileStatus = document.getElementById("fileStatus");
const timeStatus = document.getElementById("timeStatus");
const outputWaveCanvas = document.getElementById("outputWaveCanvas");
const outputWaveCtx = outputWaveCanvas.getContext("2d");
const playButton = document.getElementById("playButton");
const stopButton = document.getElementById("stopButton");
const downloadButton = document.getElementById("downloadButton");
const clearCurveButton = document.getElementById("clearCurveButton");
const resetButton = document.getElementById("resetButton");
const chainDiagram = document.getElementById("chainDiagram");
const canvas = document.getElementById("waveCanvas");
const ctx = canvas.getContext("2d");
const penTool = document.getElementById("penTool");
const eraserTool = document.getElementById("eraserTool");
const eraseModifier = /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgentData?.platform || "")
  ? "metaKey"
  : "ctrlKey";
const lowpassMode = document.getElementById("lowpassMode");
const highpassMode = document.getElementById("highpassMode");
const bandpassMode = document.getElementById("bandpassMode");
const combMode = document.getElementById("combMode");
const flangerMode = document.getElementById("flangerMode");
const chorusMode = document.getElementById("chorusMode");
const delayMode = document.getElementById("delayMode");
const parameterBar = document.getElementById("parameterBar");
const bandpassCenterParam = document.getElementById("bandpassCenterParam");
const bandpassWidthParam = document.getElementById("bandpassWidthParam");
const combDelayParam = document.getElementById("combDelayParam");
const combFeedbackParam = document.getElementById("combFeedbackParam");
const combMixParam = document.getElementById("combMixParam");
const flangerDelayParam = document.getElementById("flangerDelayParam");
const flangerDepthParam = document.getElementById("flangerDepthParam");
const flangerRateParam = document.getElementById("flangerRateParam");
const flangerFeedbackParam = document.getElementById("flangerFeedbackParam");
const chorusDelayParam = document.getElementById("chorusDelayParam");
const chorusDepthParam = document.getElementById("chorusDepthParam");
const chorusRateParam = document.getElementById("chorusRateParam");
const chorusMixParam = document.getElementById("chorusMixParam");
const delayTimeParam = document.getElementById("delayTimeParam");
const delayFeedbackParam = document.getElementById("delayFeedbackParam");
const delayMixParam = document.getElementById("delayMixParam");
const parameterLegend = document.getElementById("parameterLegend");
const cutoffReadout = document.getElementById("cutoffReadout");
const downloadReadout = document.getElementById("downloadReadout");
const modeReadout = document.getElementById("modeReadout");
const pointsReadout = document.getElementById("pointsReadout");
const meterRows = Array.from(document.querySelectorAll("[data-meter-channel]"));
const meterClipButton = document.getElementById("meterClipButton");

const transformSettings = {
  outputGain: 0.95
};

const largeFileSeconds = 180;
const sampleNoiseDuration = 8;
const sampleNoiseBurstSeconds = 0.045833;
const sampleNoiseGapSeconds = 0.020833;
const sampleNoiseAttackSeconds = 0.003;
const sampleNoiseDecaySeconds = 0.014;
const sampleNoiseSustainLevel = 0.22;
const sampleNoiseReleaseSeconds = 0.018;
const sampleNoiseGain = 0.32;

const curveColors = {
  lowpass: "#6fa8dc",
  highpass: "#eb6f75",
  bandpassCenter: "#8fcf7a",
  bandpassWidth: "#6fa8dc",
  combDelay: "#f2b705",
  combFeedback: "#8fcf7a",
  combMix: "#6fa8dc",
  flangerDelay: "#f2b705",
  flangerDepth: "#b887f4",
  flangerRate: "#eb6f75",
  flangerFeedback: "#8fcf7a",
  chorusDelay: "#f2b705",
  chorusDepth: "#b887f4",
  chorusRate: "#8fcf7a",
  chorusMix: "#6fa8dc",
  delayTime: "#f2b705",
  delayFeedback: "#8fcf7a",
  delayMix: "#6fa8dc"
};

const effects = {
  lowpass: {
    enabled: false
  },
  highpass: {
    enabled: false
  },
  bandpass: {
    enabled: false
  },
  comb: {
    enabled: false
  },
  flanger: {
    enabled: false
  },
  chorus: {
    enabled: false
  },
  delay: {
    enabled: false
  }
};

let audioContext;
let audioSetupPromise = null;
let node;
let outputMeter;
let workletBufferLoaded = false;
let buffer;
let waveform = [];
let outputWaveCssWidth = 1;
let outputWaveCssHeight = 96;
let outputHoverProgress = null;
let isWaveSeeking = false;
let activeCurve = null;
let chainOrder = [];
let draggedChainEffect = null;
let selectedTool = "pen";
let selectedPoint = null;
let hoveredPoint = null;
let dragging = false;
let playheadSeconds = 0;
const currentCutoffs = {
  lowpass: 1000,
  highpass: 400,
  bandpassCenter: 1200
};
let currentBandPassQ = 2.2;
let currentBandPassWidth = 0;
const currentComb = {
  delayMs: 8,
  feedback: 0.8,
  mix: 0.9
};
const currentFlanger = {
  delayMs: 2,
  depthMs: 6,
  rateHz: 0.3,
  feedback: 0.65
};
const currentChorus = {
  delayMs: 22,
  depthMs: 10,
  rateHz: 0.65,
  mix: 0.55
};
const currentDelay = {
  timeMs: 420,
  feedback: 0.48,
  mix: 0.42
};
let downloadUrl = null;
let renderAbortController = null;
let isPlaying = false;
let playbackToken = 0;
let renderOffline = null;
let canvasCssWidth = 1;
let canvasCssHeight = 1;
let canvasBaseWidth = 0;
let meterAnimationFrame = 0;
let meterLastFrameTime = performance.now();
let meterClipLatched = false;
const meterDisplay = meterRows.map(() => ({
  peak: 0,
  rms: 0,
  hold: 0,
  holdUntil: 0
}));
const canvasMinimumWidth = 1800;
const canvasBaseHeight = 620;
const axisWidth = 62;
const minCutoffHz = 40;
const maxCutoffHz = 18000;
const defaultCutoffY = 0.53;
const defaultHighPassY = 0.38;
const defaultBandPassCenterY = 0.56;
const defaultBandPassWidthY = 0;
const defaultCombDelayY = 0.523296;
const defaultCombFeedbackY = 0.842105;
const defaultCombMixY = 0.9;
const defaultFlangerDelayY = 0.462756;
const defaultFlangerDepthY = 0.6;
const defaultFlangerRateY = 0.490459;
const defaultFlangerFeedbackY = 0.764706;
const defaultChorusDelayY = 0.48;
const defaultChorusDepthY = 0.5;
const defaultChorusRateY = 0.69477;
const defaultChorusMixY = 0.55;
const defaultDelayTimeY = 0.228571;
const defaultDelayFeedbackY = 0.564706;
const defaultDelayMixY = 0.42;

const curves = {
  lowpass: [{ x: 0, y: defaultCutoffY }, { x: 1, y: defaultCutoffY }],
  highpass: [{ x: 0, y: defaultHighPassY }, { x: 1, y: defaultHighPassY }],
  bandpassCenter: [{ x: 0, y: defaultBandPassCenterY }, { x: 1, y: defaultBandPassCenterY }],
  bandpassWidth: [{ x: 0, y: defaultBandPassWidthY }, { x: 1, y: defaultBandPassWidthY }],
  combDelay: [{ x: 0, y: defaultCombDelayY }, { x: 1, y: defaultCombDelayY }],
  combFeedback: [{ x: 0, y: defaultCombFeedbackY }, { x: 1, y: defaultCombFeedbackY }],
  combMix: [{ x: 0, y: defaultCombMixY }, { x: 1, y: defaultCombMixY }],
  flangerDelay: [{ x: 0, y: defaultFlangerDelayY }, { x: 1, y: defaultFlangerDelayY }],
  flangerDepth: [{ x: 0, y: defaultFlangerDepthY }, { x: 1, y: defaultFlangerDepthY }],
  flangerRate: [{ x: 0, y: defaultFlangerRateY }, { x: 1, y: defaultFlangerRateY }],
  flangerFeedback: [{ x: 0, y: defaultFlangerFeedbackY }, { x: 1, y: defaultFlangerFeedbackY }],
  chorusDelay: [{ x: 0, y: defaultChorusDelayY }, { x: 1, y: defaultChorusDelayY }],
  chorusDepth: [{ x: 0, y: defaultChorusDepthY }, { x: 1, y: defaultChorusDepthY }],
  chorusRate: [{ x: 0, y: defaultChorusRateY }, { x: 1, y: defaultChorusRateY }],
  chorusMix: [{ x: 0, y: defaultChorusMixY }, { x: 1, y: defaultChorusMixY }],
  delayTime: [{ x: 0, y: defaultDelayTimeY }, { x: 1, y: defaultDelayTimeY }],
  delayFeedback: [{ x: 0, y: defaultDelayFeedbackY }, { x: 1, y: defaultDelayFeedbackY }],
  delayMix: [{ x: 0, y: defaultDelayMixY }, { x: 1, y: defaultDelayMixY }]
};

const defaultCurves = {
  lowpass: () => [{ x: 0, y: defaultCutoffY }, { x: 1, y: defaultCutoffY }],
  highpass: () => [{ x: 0, y: defaultHighPassY }, { x: 1, y: defaultHighPassY }],
  bandpassCenter: () => [{ x: 0, y: defaultBandPassCenterY }, { x: 1, y: defaultBandPassCenterY }],
  bandpassWidth: () => [{ x: 0, y: defaultBandPassWidthY }, { x: 1, y: defaultBandPassWidthY }],
  combDelay: () => [{ x: 0, y: defaultCombDelayY }, { x: 1, y: defaultCombDelayY }],
  combFeedback: () => [{ x: 0, y: defaultCombFeedbackY }, { x: 1, y: defaultCombFeedbackY }],
  combMix: () => [{ x: 0, y: defaultCombMixY }, { x: 1, y: defaultCombMixY }],
  flangerDelay: () => [{ x: 0, y: defaultFlangerDelayY }, { x: 1, y: defaultFlangerDelayY }],
  flangerDepth: () => [{ x: 0, y: defaultFlangerDepthY }, { x: 1, y: defaultFlangerDepthY }],
  flangerRate: () => [{ x: 0, y: defaultFlangerRateY }, { x: 1, y: defaultFlangerRateY }],
  flangerFeedback: () => [{ x: 0, y: defaultFlangerFeedbackY }, { x: 1, y: defaultFlangerFeedbackY }],
  chorusDelay: () => [{ x: 0, y: defaultChorusDelayY }, { x: 1, y: defaultChorusDelayY }],
  chorusDepth: () => [{ x: 0, y: defaultChorusDepthY }, { x: 1, y: defaultChorusDepthY }],
  chorusRate: () => [{ x: 0, y: defaultChorusRateY }, { x: 1, y: defaultChorusRateY }],
  chorusMix: () => [{ x: 0, y: defaultChorusMixY }, { x: 1, y: defaultChorusMixY }],
  delayTime: () => [{ x: 0, y: defaultDelayTimeY }, { x: 1, y: defaultDelayTimeY }],
  delayFeedback: () => [{ x: 0, y: defaultDelayFeedbackY }, { x: 1, y: defaultDelayFeedbackY }],
  delayMix: () => [{ x: 0, y: defaultDelayMixY }, { x: 1, y: defaultDelayMixY }]
};

const editedCurves = {
  lowpass: false,
  highpass: false,
  bandpassCenter: false,
  bandpassWidth: false,
  combDelay: false,
  combFeedback: false,
  combMix: false,
  flangerDelay: false,
  flangerDepth: false,
  flangerRate: false,
  flangerFeedback: false,
  chorusDelay: false,
  chorusDepth: false,
  chorusRate: false,
  chorusMix: false,
  delayTime: false,
  delayFeedback: false,
  delayMix: false
};

const curveLabels = {
  lowpass: "Low Pass",
  highpass: "High Pass",
  bandpassCenter: "Band Pass Center Frequency",
  bandpassWidth: "Band Pass Width",
  combDelay: "Comb Delay Time",
  combFeedback: "Comb Feedback",
  combMix: "Comb Mix",
  flangerDelay: "Flanger Delay Time",
  flangerDepth: "Flanger Depth",
  flangerRate: "Flanger Rate",
  flangerFeedback: "Flanger Feedback",
  chorusDelay: "Chorus Delay Time",
  chorusDepth: "Chorus Depth",
  chorusRate: "Chorus Rate",
  chorusMix: "Chorus Mix",
  delayTime: "Delay Time",
  delayFeedback: "Delay Feedback",
  delayMix: "Delay Mix"
};

const effectLabels = {
  lowpass: "Low Pass",
  highpass: "High Pass",
  bandpass: "Band Pass",
  comb: "Comb",
  flanger: "Flanger",
  chorus: "Chorus",
  delay: "Delay"
};

const parameterLegends = {
  lowpass: [
    { color: curveColors.lowpass, text: "cutoff 40 Hz-18 kHz" }
  ],
  highpass: [
    { color: curveColors.highpass, text: "cutoff 40 Hz-18 kHz" }
  ],
  bandpass: [
    { color: curveColors.bandpassCenter, text: "center frequency 40 Hz-18 kHz" },
    { color: curveColors.bandpassWidth, text: "width narrow-full" }
  ],
  comb: [
    { color: curveColors.combDelay, text: "delay time 0.5-100 ms" },
    { color: curveColors.combFeedback, text: "feedback 0.00-0.95" },
    { color: curveColors.combMix, text: "mix 0-100%" }
  ],
  flanger: [
    { color: curveColors.flangerDelay, text: "delay time 0.5-10 ms" },
    { color: curveColors.flangerDepth, text: "depth 0-10 ms" },
    { color: curveColors.flangerRate, text: "rate 0.02-5 Hz" },
    { color: curveColors.flangerFeedback, text: "feedback 0.00-0.85" }
  ],
  chorus: [
    { color: curveColors.chorusDelay, text: "delay time 10-35 ms" },
    { color: curveColors.chorusDepth, text: "depth 0-20 ms" },
    { color: curveColors.chorusRate, text: "rate 0.02-3 Hz" },
    { color: curveColors.chorusMix, text: "mix 0-100%" }
  ],
  delay: [
    { color: curveColors.delayTime, text: "delay time 100 ms-1.5 s" },
    { color: curveColors.delayFeedback, text: "feedback 0.00-0.85" },
    { color: curveColors.delayMix, text: "mix 0-100%" }
  ]
};

function effectForCurve(name) {
  if (!name) return null;
  if (name === "bandpassCenter" || name === "bandpassWidth") return "bandpass";
  if (name === "combDelay" || name === "combFeedback" || name === "combMix") return "comb";
  if (name === "flangerDelay" || name === "flangerDepth" || name === "flangerRate" || name === "flangerFeedback") return "flanger";
  if (name === "chorusDelay" || name === "chorusDepth" || name === "chorusRate" || name === "chorusMix") return "chorus";
  if (name === "delayTime" || name === "delayFeedback" || name === "delayMix") return "delay";
  return name;
}

function defaultCurveForEffect(name) {
  if (name === "comb") return "combDelay";
  if (name === "flanger") return "flangerDelay";
  if (name === "chorus") return "chorusDelay";
  if (name === "delay") return "delayTime";
  return name === "bandpass" ? "bandpassCenter" : name;
}

function effectLabel(name) {
  return effectLabels[name] || curveLabels[defaultCurveForEffect(name)];
}

function effectClassName(name) {
  return `${name}Module`;
}

function curveNamesForEffect(name) {
  if (name === "bandpass") return ["bandpassCenter", "bandpassWidth"];
  if (name === "comb") return ["combDelay", "combFeedback", "combMix"];
  if (name === "flanger") return ["flangerDelay", "flangerDepth", "flangerRate", "flangerFeedback"];
  if (name === "chorus") return ["chorusDelay", "chorusDepth", "chorusRate", "chorusMix"];
  if (name === "delay") return ["delayTime", "delayFeedback", "delayMix"];
  return [name];
}

function addEffectToChain(name) {
  if (!chainOrder.includes(name)) chainOrder.push(name);
}

function removeEffectFromChain(name) {
  chainOrder = chainOrder.filter((effectName) => effectName !== name);
}

function activeChainOrder() {
  return chainOrder.filter((name) => effects[name]?.enabled);
}

function renderChainDiagram() {
  chainDiagram.replaceChildren();

  const addConnector = () => {
    const connector = document.createElement("span");
    connector.className = "chainConnector";
    connector.textContent = "-";
    chainDiagram.appendChild(connector);
  };

  const input = document.createElement("div");
  input.className = "chainTerminal";
  input.textContent = "Input";
  chainDiagram.appendChild(input);

  for (const name of chainOrder) {
    addConnector();
    const block = document.createElement("button");
    block.type = "button";
    block.draggable = true;
    block.dataset.effect = name;
    block.className = `effectModule enabled chainBlock ${effectClassName(name)}`;
    block.textContent = effectLabel(name);
    block.title = "Drag to reorder this filter in the visual chain";

    block.addEventListener("click", () => {
      setActiveCurve(defaultCurveForEffect(name));
    });

    block.addEventListener("dragstart", (event) => {
      draggedChainEffect = name;
      block.classList.add("dragging");
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", name);
    });

    block.addEventListener("dragend", () => {
      draggedChainEffect = null;
      block.classList.remove("dragging");
    });

    block.addEventListener("dragover", (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    });

    block.addEventListener("drop", (event) => {
      event.preventDefault();
      const droppedEffect = draggedChainEffect || event.dataTransfer.getData("text/plain");
      if (!droppedEffect || droppedEffect === name) return;
      const nextOrder = chainOrder.filter((effectName) => effectName !== droppedEffect);
      const targetIndex = nextOrder.indexOf(name);
      nextOrder.splice(targetIndex, 0, droppedEffect);
      chainOrder = nextOrder;
      markDownloadStale();
      sendSettings();
      renderChainDiagram();
    });

    chainDiagram.appendChild(block);
  }

  addConnector();
  const output = document.createElement("div");
  output.className = "chainTerminal";
  output.textContent = "Output";
  output.addEventListener("dragover", (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  });
  output.addEventListener("drop", (event) => {
    event.preventDefault();
    const droppedEffect = draggedChainEffect || event.dataTransfer.getData("text/plain");
    if (!droppedEffect) return;
    chainOrder = chainOrder.filter((effectName) => effectName !== droppedEffect);
    chainOrder.push(droppedEffect);
    markDownloadStale();
    sendSettings();
    renderChainDiagram();
  });
  chainDiagram.appendChild(output);
}

function renderParameterLegend() {
  const activeEffect = effectForCurve(activeCurve);
  const items = activeEffect && effects[activeEffect]?.enabled ? parameterLegends[activeEffect] || [] : [];
  parameterLegend.replaceChildren();
  for (const item of items) {
    const legendItem = document.createElement("span");
    legendItem.className = "legendItem";

    const swatch = document.createElement("span");
    swatch.className = "legendSwatch";
    swatch.style.background = item.color;

    const label = document.createElement("span");
    label.textContent = item.text;

    legendItem.append(swatch, label);
    parameterLegend.appendChild(legendItem);
  }
}

function resizeCanvas() {
  const frameRect = canvas.parentElement.getBoundingClientRect();
  const targetWidth = Math.max(frameRect.width, canvasBaseWidth, canvasMinimumWidth);
  canvasBaseWidth = targetWidth;
  canvas.style.width = `${Math.round(canvasBaseWidth)}px`;
  canvas.style.height = `${canvasBaseHeight}px`;
  const rect = canvas.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  canvasCssWidth = Math.max(1, rect.width);
  canvasCssHeight = Math.max(1, rect.height);
  const nextWidth = Math.max(1, Math.floor(canvasCssWidth * scale));
  const nextHeight = Math.max(1, Math.floor(canvasCssHeight * scale));
  if (canvas.width !== nextWidth) canvas.width = nextWidth;
  if (canvas.height !== nextHeight) canvas.height = nextHeight;
  const outputRect = outputWaveCanvas.getBoundingClientRect();
  outputWaveCssWidth = Math.max(1, outputRect.width);
  outputWaveCssHeight = Math.max(1, outputRect.height);
  const outputWidth = Math.max(1, Math.floor(outputWaveCssWidth * scale));
  const outputHeight = Math.max(1, Math.floor(outputWaveCssHeight * scale));
  if (outputWaveCanvas.width !== outputWidth) outputWaveCanvas.width = outputWidth;
  if (outputWaveCanvas.height !== outputHeight) outputWaveCanvas.height = outputHeight;
  draw();
}

function formatTime(seconds) {
  return `${seconds.toFixed(2)} s`;
}

function formatClock(seconds) {
  const safeSeconds = Math.max(0, seconds || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remaining = safeSeconds - (minutes * 60);
  return `${String(minutes).padStart(2, "0")}:${remaining.toFixed(2).padStart(5, "0")}`;
}

function linearToDb(value) {
  return value > 0.000001 ? 20 * Math.log10(value) : -Infinity;
}

function meterPosition(value) {
  const db = linearToDb(value);
  return Math.max(0, Math.min(1, (db + 60) / 60));
}

function smoothMeterValue(current, target, elapsedMs, attackMs, releaseMs) {
  const time = target > current ? attackMs : releaseMs;
  const amount = 1 - Math.exp(-elapsedMs / Math.max(1, time));
  return current + ((target - current) * amount);
}

function updateMeterDisplay(now) {
  const elapsedMs = Math.min(100, Math.max(0, now - meterLastFrameTime));
  meterLastFrameTime = now;
  const measuredChannels = outputMeter?.read() || [];

  meterRows.forEach((row, index) => {
    const measured = measuredChannels[index] || { peak: 0, rms: 0, clipped: false };
    const display = meterDisplay[index];
    display.peak = smoothMeterValue(display.peak, measured.peak, elapsedMs, 18, 320);
    display.rms = smoothMeterValue(display.rms, measured.rms, elapsedMs, 45, 420);

    if (measured.peak >= display.hold) {
      display.hold = measured.peak;
      display.holdUntil = now + 1000;
    } else if (now > display.holdUntil) {
      display.hold = smoothMeterValue(display.hold, measured.peak, elapsedMs, 0, 700);
    }

    if (measured.clipped) meterClipLatched = true;
    row.querySelector(".meterRms").style.transform = `scaleX(${meterPosition(display.rms)})`;
    row.querySelector(".meterPeak").style.transform = `scaleX(${meterPosition(display.peak)})`;
    row.querySelector(".meterHold").style.left = `${meterPosition(display.hold) * 100}%`;
    const peakDb = linearToDb(display.peak);
    row.querySelector(".meterValue").textContent = Number.isFinite(peakDb) ? peakDb.toFixed(1) : "-∞";
  });

  meterClipButton.classList.toggle("clipped", meterClipLatched);
  meterClipButton.setAttribute("aria-pressed", String(meterClipLatched));
  meterAnimationFrame = requestAnimationFrame(updateMeterDisplay);
}

function startMeterAnimation() {
  if (meterAnimationFrame) return;
  meterLastFrameTime = performance.now();
  meterAnimationFrame = requestAnimationFrame(updateMeterDisplay);
}

function formatCutoff(hz) {
  return hz >= 1000 ? `${(hz / 1000).toFixed(1)} kHz` : `${Math.round(hz)} Hz`;
}

function qFromWidthNorm(y) {
  const clamped = Math.max(0, Math.min(1, y));
  return 0.5 * Math.pow(24, 1 - clamped);
}

function formatQ(q) {
  return `Q ${q.toFixed(2)}`;
}

function formatWidth(widthNorm) {
  const clamped = Math.max(0, Math.min(1, widthNorm));
  return clamped >= 0.995 ? "Width 1.00 full" : `Width ${clamped.toFixed(2)}`;
}

function combDelayMsFromNorm(y) {
  const minMs = 0.5;
  const maxMs = 100;
  const clamped = Math.max(0, Math.min(1, y));
  return minMs * Math.pow(maxMs / minMs, clamped);
}

function normFromCombDelayMs(ms) {
  const minMs = 0.5;
  const maxMs = 100;
  const clamped = Math.max(minMs, Math.min(maxMs, ms));
  return Math.log(clamped / minMs) / Math.log(maxMs / minMs);
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

function normFromFlangerDelayMs(ms) {
  const minMs = 0.5;
  const maxMs = 10;
  const clamped = Math.max(minMs, Math.min(maxMs, ms));
  return Math.log(clamped / minMs) / Math.log(maxMs / minMs);
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

function normFromFlangerRateHz(hz) {
  const minHz = 0.02;
  const maxHz = 5;
  const clamped = Math.max(minHz, Math.min(maxHz, hz));
  return Math.log(clamped / minHz) / Math.log(maxHz / minHz);
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

function normFromChorusRateHz(hz) {
  const minHz = 0.02;
  const maxHz = 3;
  const clamped = Math.max(minHz, Math.min(maxHz, hz));
  return Math.log(clamped / minHz) / Math.log(maxHz / minHz);
}

function delayTimeMsFromNorm(y) {
  return 100 + (Math.max(0, Math.min(1, y)) * 1400);
}

function formatCombValue(name, y) {
  if (name === "combDelay") return `${combDelayMsFromNorm(y).toFixed(1)} ms`;
  if (name === "combFeedback") return combFeedbackFromNorm(y).toFixed(2);
  if (name === "combMix") return `${Math.round(combMixFromNorm(y) * 100)}%`;
  return "";
}

function formatTimeEffectValue(name, y) {
  if (name === "flangerDelay") return `${flangerDelayMsFromNorm(y).toFixed(1)} ms`;
  if (name === "flangerDepth") return `${flangerDepthMsFromNorm(y).toFixed(1)} ms`;
  if (name === "flangerRate") return `${flangerRateHzFromNorm(y).toFixed(2)} Hz`;
  if (name === "flangerFeedback") return modulationFeedbackFromNorm(y).toFixed(2);
  if (name === "chorusDelay") return `${chorusDelayMsFromNorm(y).toFixed(1)} ms`;
  if (name === "chorusDepth") return `${chorusDepthMsFromNorm(y).toFixed(1)} ms`;
  if (name === "chorusRate") return `${chorusRateHzFromNorm(y).toFixed(2)} Hz`;
  if (name === "chorusMix") return `${Math.round(combMixFromNorm(y) * 100)}%`;
  if (name === "delayTime") return delayTimeMsFromNorm(y) >= 1000
    ? `${(delayTimeMsFromNorm(y) / 1000).toFixed(2)} s`
    : `${Math.round(delayTimeMsFromNorm(y))} ms`;
  if (name === "delayFeedback") return modulationFeedbackFromNorm(y).toFixed(2);
  if (name === "delayMix") return `${Math.round(combMixFromNorm(y) * 100)}%`;
  return "";
}

function formatCurrentCombValue(name) {
  const norm = buffer?.duration ? Math.max(0, Math.min(1, playheadSeconds / buffer.duration)) : 0;
  const curveValue = valueAt(curves[name], norm);
  if (name === "combDelay") return `${(isPlaying ? currentComb.delayMs : combDelayMsFromNorm(curveValue)).toFixed(1)} ms`;
  if (name === "combFeedback") return (isPlaying ? currentComb.feedback : combFeedbackFromNorm(curveValue)).toFixed(2);
  if (name === "combMix") return `${Math.round((isPlaying ? currentComb.mix : combMixFromNorm(curveValue)) * 100)}%`;
  return "";
}

function formatCurrentTimeEffectValue(name) {
  const norm = buffer?.duration ? Math.max(0, Math.min(1, playheadSeconds / buffer.duration)) : 0;
  const curveValue = valueAt(curves[name], norm);
  if (name === "flangerDelay") return `${(isPlaying ? currentFlanger.delayMs : flangerDelayMsFromNorm(curveValue)).toFixed(1)} ms`;
  if (name === "flangerDepth") return `${(isPlaying ? currentFlanger.depthMs : flangerDepthMsFromNorm(curveValue)).toFixed(1)} ms`;
  if (name === "flangerRate") return `${(isPlaying ? currentFlanger.rateHz : flangerRateHzFromNorm(curveValue)).toFixed(2)} Hz`;
  if (name === "flangerFeedback") return (isPlaying ? currentFlanger.feedback : modulationFeedbackFromNorm(curveValue)).toFixed(2);
  if (name === "chorusDelay") return `${(isPlaying ? currentChorus.delayMs : chorusDelayMsFromNorm(curveValue)).toFixed(1)} ms`;
  if (name === "chorusDepth") return `${(isPlaying ? currentChorus.depthMs : chorusDepthMsFromNorm(curveValue)).toFixed(1)} ms`;
  if (name === "chorusRate") return `${(isPlaying ? currentChorus.rateHz : chorusRateHzFromNorm(curveValue)).toFixed(2)} Hz`;
  if (name === "chorusMix") return `${Math.round((isPlaying ? currentChorus.mix : combMixFromNorm(curveValue)) * 100)}%`;
  if (name === "delayTime") {
    const value = isPlaying ? currentDelay.timeMs : delayTimeMsFromNorm(curveValue);
    return value >= 1000 ? `${(value / 1000).toFixed(2)} s` : `${Math.round(value)} ms`;
  }
  if (name === "delayFeedback") return (isPlaying ? currentDelay.feedback : modulationFeedbackFromNorm(curveValue)).toFixed(2);
  if (name === "delayMix") return `${Math.round((isPlaying ? currentDelay.mix : combMixFromNorm(curveValue)) * 100)}%`;
  return "";
}

function bandWidthHalfHeight(widthNorm, centerY) {
  const clamped = Math.max(0, Math.min(1, widthNorm));
  return clamped * Math.max(centerY, 1 - centerY);
}

function cutoffFromNorm(y) {
  const clamped = Math.max(0, Math.min(1, y));
  return minCutoffHz * Math.pow(maxCutoffHz / minCutoffHz, clamped);
}

function yFromCutoff(hz) {
  const clamped = Math.max(minCutoffHz, Math.min(maxCutoffHz, hz));
  return 1 - (Math.log(clamped / minCutoffHz) / Math.log(maxCutoffHz / minCutoffHz));
}

function sortCurve(curve) {
  curve.sort((a, b) => a.x - b.x);
}

function sendCurves() {
  markDownloadStale();
  if (!node) return;
  node.port.postMessage({
    type: "curves",
    lowPassCurve: curves.lowpass,
    highPassCurve: curves.highpass,
    bandPassCenterCurve: curves.bandpassCenter,
    bandPassWidthCurve: curves.bandpassWidth,
    combDelayCurve: curves.combDelay,
    combFeedbackCurve: curves.combFeedback,
    combMixCurve: curves.combMix,
    flangerDelayCurve: curves.flangerDelay,
    flangerDepthCurve: curves.flangerDepth,
    flangerRateCurve: curves.flangerRate,
    flangerFeedbackCurve: curves.flangerFeedback,
    chorusDelayCurve: curves.chorusDelay,
    chorusDepthCurve: curves.chorusDepth,
    chorusRateCurve: curves.chorusRate,
    chorusMixCurve: curves.chorusMix,
    delayTimeCurve: curves.delayTime,
    delayFeedbackCurve: curves.delayFeedback,
    delayMixCurve: curves.delayMix
  });
}

function sendSettings() {
  markDownloadStale();
  if (!node) return;
  node.port.postMessage({
    type: "settings",
    settings: getSettings()
  });
}

function markDownloadStale() {
  if (!buffer) return;
  if (downloadUrl) {
    URL.revokeObjectURL(downloadUrl);
    downloadUrl = null;
  }
  downloadReadout.textContent = "needs export";
}

function clearDownload() {
  if (downloadUrl) URL.revokeObjectURL(downloadUrl);
  downloadUrl = null;
}

function setTransportBusy(isBusy) {
  playButton.disabled = isBusy || !buffer;
  stopButton.disabled = isBusy || !buffer;
  outputWaveCanvas.setAttribute("aria-disabled", String(isBusy || !buffer));
  downloadButton.disabled = isBusy || !buffer;
  fileInput.disabled = isBusy;
}

function setRenderBusy(isBusy) {
  playButton.disabled = isBusy || !buffer;
  stopButton.disabled = isBusy || !buffer;
  outputWaveCanvas.setAttribute("aria-disabled", String(isBusy || !buffer));
  fileInput.disabled = isBusy;
  downloadButton.disabled = !buffer;
}

function nextPlaybackToken() {
  playbackToken += 1;
  return playbackToken;
}

function isCurrentPlaybackMessage(data) {
  return data.token == null || data.token === playbackToken;
}

async function playAudio() {
  if (!buffer) return;
  if (isPlaying) return;
  try {
    await ensureAudio();
    if (isPlaying) return;
    node.port.postMessage({ type: "seek", seconds: playheadSeconds, token: playbackToken });
    node.port.postMessage({ type: "play", token: nextPlaybackToken() });
    isPlaying = true;
    playButton.textContent = "Playing";
  } catch (error) {
    console.error(error);
    fileStatus.textContent = error.message;
  }
}

function stopAudio() {
  if (!buffer) return;
  node?.port.postMessage({ type: "stop", reset: true, token: nextPlaybackToken() });
  isPlaying = false;
  playheadSeconds = 0;
  playButton.textContent = "Play";
  draw();
}

function forceStopAudio() {
  if (!buffer) return;
  node?.port.postMessage({ type: "stop", reset: true, token: nextPlaybackToken() });
  isPlaying = false;
  playheadSeconds = 0;
  playButton.textContent = "Play";
  draw();
}

function toggleAudio() {
  if (isPlaying) stopAudio();
  else playAudio();
}

function getSettings() {
  return {
    ...transformSettings,
    lowPassEnabled: effects.lowpass.enabled,
    highPassEnabled: effects.highpass.enabled,
    bandPassEnabled: effects.bandpass.enabled,
    combEnabled: effects.comb.enabled,
    flangerEnabled: effects.flanger.enabled,
    chorusEnabled: effects.chorus.enabled,
    delayEnabled: effects.delay.enabled,
    chainOrder: activeChainOrder()
  };
}

async function getOfflineRenderer() {
  if (!renderOffline) {
    const module = await import("./offline-render.js?v=20261006-stream-01");
    renderOffline = module.renderOffline;
  }
  return renderOffline;
}

async function ensureAudioContext() {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      throw new Error("Web Audio is not available in this browser.");
    }
    audioContext = new AudioContextClass();
  }
  if (audioContext.state !== "running") await audioContext.resume();
}

function sendBufferToWorklet() {
  if (!node || !buffer) return;
  const left = new Float32Array(buffer.getChannelData(0));
  const right = new Float32Array(buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : buffer.getChannelData(0));
  node.port.postMessage({ type: "buffer", left, right, sampleRate: buffer.sampleRate }, [left.buffer, right.buffer]);
  workletBufferLoaded = true;
}

function valueAt(curve, x) {
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

function drawFilterFill(name, curve, color) {
  if (!effects[name].enabled) return;
  const w = canvasCssWidth;
  const h = canvasCssHeight;
  const plotW = Math.max(1, w - axisWidth);
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.16;
  ctx.beginPath();
  ctx.moveTo(axisWidth, name === "highpass" ? 0 : h);
  for (let i = 0; i <= plotW; i += 3) {
    const x = i / plotW;
    const y = valueAt(curve, x);
    ctx.lineTo(axisWidth + (x * plotW), (1 - y) * h);
  }
  ctx.lineTo(w, name === "highpass" ? 0 : h);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function bandpassBoundaryPoint(x, side) {
  const centerY = valueAt(curves.bandpassCenter, x);
  const halfHeight = bandWidthHalfHeight(valueAt(curves.bandpassWidth, x), centerY);
  return Math.max(0, Math.min(1, centerY + (side * halfHeight)));
}

function drawBandPassFill() {
  if (!effects.bandpass.enabled) return;
  const w = canvasCssWidth;
  const h = canvasCssHeight;
  const plotW = Math.max(1, w - axisWidth);
  const color = curveColors.bandpassWidth;
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.18;
  ctx.beginPath();
  for (let i = 0; i <= plotW; i += 3) {
    const x = i / plotW;
    const y = bandpassBoundaryPoint(x, 1);
    const px = axisWidth + (x * plotW);
    const py = (1 - y) * h;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  for (let i = plotW; i >= 0; i -= 3) {
    const x = i / plotW;
    const y = bandpassBoundaryPoint(x, -1);
    ctx.lineTo(axisWidth + (x * plotW), (1 - y) * h);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function pointScreenPosition(name, point) {
  const plotW = Math.max(1, canvasCssWidth - axisWidth);
  const px = axisWidth + (point.x * plotW);
  if (name !== "bandpassWidth") return { x: px, y: (1 - point.y) * canvasCssHeight };
  const centerY = valueAt(curves.bandpassCenter, point.x);
  const edgeY = Math.max(0, Math.min(1, centerY + bandWidthHalfHeight(point.y, centerY)));
  return { x: px, y: (1 - edgeY) * canvasCssHeight };
}

function drawPointLabel(name, point, color) {
  const w = canvasCssWidth;
  const h = canvasCssHeight;
  const position = pointScreenPosition(name, point);
  const px = position.x;
  const py = position.y;
  const label = name === "bandpassWidth"
    ? formatWidth(point.y)
    : (effectForCurve(name) === "comb" ? formatCombValue(name, point.y) : (
      ["flanger", "chorus", "delay"].includes(effectForCurve(name))
        ? formatTimeEffectValue(name, point.y)
        : formatCutoff(cutoffFromNorm(point.y))
    ));
  ctx.save();
  ctx.font = "600 11px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  const metrics = ctx.measureText(label);
  const labelW = metrics.width + 14;
  const labelH = 22;
  const x = Math.max(axisWidth + 6, Math.min(w - labelW - 6, px + 10));
  const y = Math.max(6, Math.min(h - labelH - 6, py - 30));
  ctx.fillStyle = "rgba(7, 17, 28, 0.96)";
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x, y, labelW, labelH, 5);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#e8f0f6";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x + 7, y + (labelH / 2));
  ctx.restore();
}

function drawCurve(name, curve, color, width, fillPoints) {
  const w = canvasCssWidth;
  const h = canvasCssHeight;
  const plotW = Math.max(1, w - axisWidth);
  ctx.save();
  const effectName = effectForCurve(name);
  const isSelectedCurve = fillPoints;
  ctx.globalAlpha = effects[effectName].enabled ? 1 : 0.32;
  ctx.strokeStyle = color;
  ctx.lineWidth = isSelectedCurve ? 4.8 : 2.1;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  for (let i = 0; i <= plotW; i += 3) {
    const x = i / plotW;
    const y = name === "bandpassWidth" ? bandpassBoundaryPoint(x, 1) : valueAt(curve, x);
    const px = axisWidth + (x * plotW);
    const py = (1 - y) * h;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  if (fillPoints) {
    for (let i = 0; i < curve.length; i += 1) {
      const point = curve[i];
      const position = pointScreenPosition(name, point);
      ctx.beginPath();
      ctx.arc(position.x, position.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = "#06111c";
      ctx.lineWidth = 2;
      ctx.stroke();
      if (i === selectedPoint || i === hoveredPoint) {
        drawPointLabel(name, point, color);
      }
    }
  }
  ctx.restore();
}

function drawLowPassAxis() {
  const h = canvasCssHeight;
  const labels = [18000, 8000, 2000, 500, 100, 40];
  const activeEffect = effectForCurve(activeCurve);
  ctx.save();
  ctx.globalAlpha = activeEffect && effects[activeEffect].enabled ? 1 : 0.52;
  ctx.fillStyle = "rgba(7, 17, 28, 0.74)";
  ctx.fillRect(0, 0, axisWidth, h);
  ctx.strokeStyle = "rgba(104, 145, 178, 0.62)";
  ctx.beginPath();
  ctx.moveTo(axisWidth + 0.5, 0);
  ctx.lineTo(axisWidth + 0.5, h);
  ctx.stroke();
  ctx.font = "600 11px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  for (const hz of labels) {
    const y = yFromCutoff(hz) * h;
    const labelY = Math.max(10, Math.min(h - 10, y));
    ctx.strokeStyle = "rgba(72, 111, 143, 0.28)";
    ctx.beginPath();
    ctx.moveTo(axisWidth - 8, y);
    ctx.lineTo(canvasCssWidth, y);
    ctx.stroke();
    ctx.fillStyle = "rgba(13, 27, 41, 0.92)";
    ctx.fillRect(4, labelY - 9, axisWidth - 14, 18);
    ctx.fillStyle = "#aabccc";
    ctx.fillText(formatCutoff(hz), axisWidth - 11, labelY);
  }
  ctx.restore();
}

function drawWidthAxis() {
  const h = canvasCssHeight;
  const labels = [
    { value: 1, text: "full" },
    { value: 0.75, text: "75%" },
    { value: 0.5, text: "50%" },
    { value: 0.25, text: "25%" },
    { value: 0, text: "narrow" }
  ];
  const activeEffect = effectForCurve(activeCurve);
  ctx.save();
  ctx.globalAlpha = activeEffect && effects[activeEffect].enabled ? 1 : 0.52;
  ctx.fillStyle = "rgba(7, 17, 28, 0.74)";
  ctx.fillRect(0, 0, axisWidth, h);
  ctx.strokeStyle = "rgba(104, 145, 178, 0.62)";
  ctx.beginPath();
  ctx.moveTo(axisWidth + 0.5, 0);
  ctx.lineTo(axisWidth + 0.5, h);
  ctx.stroke();
  ctx.font = "600 11px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  for (const label of labels) {
    const y = (1 - label.value) * h;
    const labelY = Math.max(10, Math.min(h - 10, y));
    ctx.strokeStyle = "rgba(72, 111, 143, 0.28)";
    ctx.beginPath();
    ctx.moveTo(axisWidth - 8, y);
    ctx.lineTo(canvasCssWidth, y);
    ctx.stroke();
    ctx.fillStyle = "rgba(13, 27, 41, 0.92)";
    ctx.fillRect(4, labelY - 9, axisWidth - 14, 18);
    ctx.fillStyle = "#aabccc";
    ctx.fillText(label.text, axisWidth - 11, labelY);
  }
  ctx.restore();
}

function drawValueAxis() {
  const h = canvasCssHeight;
  let labels;
  if (activeCurve === "combDelay" || activeCurve === "flangerDelay") {
    labels = [
      { value: activeCurve === "combDelay" ? normFromCombDelayMs(100) : normFromFlangerDelayMs(10), text: activeCurve === "combDelay" ? "100 ms" : "10 ms" },
      { value: activeCurve === "combDelay" ? normFromCombDelayMs(30) : normFromFlangerDelayMs(5), text: activeCurve === "combDelay" ? "30 ms" : "5 ms" },
      { value: activeCurve === "combDelay" ? normFromCombDelayMs(10) : normFromFlangerDelayMs(2), text: activeCurve === "combDelay" ? "10 ms" : "2 ms" },
      { value: activeCurve === "combDelay" ? normFromCombDelayMs(3) : normFromFlangerDelayMs(1), text: activeCurve === "combDelay" ? "3 ms" : "1 ms" },
      { value: activeCurve === "combDelay" ? normFromCombDelayMs(0.5) : normFromFlangerDelayMs(0.5), text: "0.5 ms" }
    ];
  } else if (activeCurve === "chorusDelay") {
    labels = [
      { value: 1, text: "35 ms" },
      { value: 0.6, text: "25 ms" },
      { value: 0.32, text: "18 ms" },
      { value: 0.12, text: "13 ms" },
      { value: 0, text: "10 ms" }
    ];
  } else if (activeCurve === "delayTime") {
    labels = [
      { value: 1, text: "1.5 s" },
      { value: 0.64, text: "1.0 s" },
      { value: 0.29, text: "500 ms" },
      { value: 0.11, text: "250 ms" },
      { value: 0, text: "100 ms" }
    ];
  } else if (activeCurve === "combFeedback" || activeCurve === "flangerFeedback" || activeCurve === "delayFeedback") {
    labels = [
      { value: 1, text: activeCurve === "combFeedback" ? "0.95" : "0.85" },
      { value: 0.75, text: activeCurve === "combFeedback" ? "0.71" : "0.64" },
      { value: 0.5, text: activeCurve === "combFeedback" ? "0.48" : "0.43" },
      { value: 0.25, text: activeCurve === "combFeedback" ? "0.24" : "0.21" },
      { value: 0, text: "0.00" }
    ];
  } else if (activeCurve === "flangerRate") {
    labels = [
      { value: normFromFlangerRateHz(5), text: "5 Hz" },
      { value: normFromFlangerRateHz(2), text: "2 Hz" },
      { value: normFromFlangerRateHz(0.5), text: "0.5 Hz" },
      { value: normFromFlangerRateHz(0.1), text: "0.1 Hz" },
      { value: normFromFlangerRateHz(0.02), text: "0.02 Hz" }
    ];
  } else if (activeCurve === "chorusRate") {
    labels = [
      { value: normFromChorusRateHz(3), text: "3 Hz" },
      { value: normFromChorusRateHz(1), text: "1 Hz" },
      { value: normFromChorusRateHz(0.3), text: "0.3 Hz" },
      { value: normFromChorusRateHz(0.08), text: "0.08 Hz" },
      { value: normFromChorusRateHz(0.02), text: "0.02 Hz" }
    ];
  } else if (activeCurve === "flangerDepth" || activeCurve === "chorusDepth") {
    labels = [
      { value: 1, text: activeCurve === "flangerDepth" ? "10 ms" : "20 ms" },
      { value: 0.75, text: activeCurve === "flangerDepth" ? "7.5 ms" : "15 ms" },
      { value: 0.5, text: activeCurve === "flangerDepth" ? "5 ms" : "10 ms" },
      { value: 0.25, text: activeCurve === "flangerDepth" ? "2.5 ms" : "5 ms" },
      { value: 0, text: "0 ms" }
    ];
  } else {
    labels = [
      { value: 1, text: "100%" },
      { value: 0.75, text: "75%" },
      { value: 0.5, text: "50%" },
      { value: 0.25, text: "25%" },
      { value: 0, text: "0%" }
    ];
  }

  const activeEffect = effectForCurve(activeCurve);
  ctx.save();
  ctx.globalAlpha = activeEffect && effects[activeEffect].enabled ? 1 : 0.52;
  ctx.fillStyle = "rgba(7, 17, 28, 0.74)";
  ctx.fillRect(0, 0, axisWidth, h);
  ctx.strokeStyle = "rgba(104, 145, 178, 0.62)";
  ctx.beginPath();
  ctx.moveTo(axisWidth + 0.5, 0);
  ctx.lineTo(axisWidth + 0.5, h);
  ctx.stroke();
  ctx.font = "600 11px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  for (const label of labels) {
    const y = (1 - label.value) * h;
    const labelY = Math.max(10, Math.min(h - 10, y));
    ctx.strokeStyle = "rgba(72, 111, 143, 0.28)";
    ctx.beginPath();
    ctx.moveTo(axisWidth - 8, y);
    ctx.lineTo(canvasCssWidth, y);
    ctx.stroke();
    ctx.fillStyle = "rgba(13, 27, 41, 0.92)";
    ctx.fillRect(4, labelY - 9, axisWidth - 14, 18);
    ctx.fillStyle = "#aabccc";
    ctx.fillText(label.text, axisWidth - 11, labelY);
  }
  ctx.restore();
}

function drawCurves() {
  if (!activeCurve) return;
  if (!effects[effectForCurve(activeCurve)].enabled) return;
  if (effectForCurve(activeCurve) === "bandpass") {
    if (activeCurve === "bandpassWidth") {
      drawCurve("bandpassCenter", curves.bandpassCenter, curveColors.bandpassCenter, 2.1, false);
      drawCurve("bandpassWidth", curves.bandpassWidth, curveColors.bandpassWidth, 4.8, true);
    } else {
      drawCurve("bandpassWidth", curves.bandpassWidth, curveColors.bandpassWidth, 2.1, false);
      drawCurve("bandpassCenter", curves.bandpassCenter, curveColors.bandpassCenter, 4.8, true);
    }
    return;
  }
  if (effectForCurve(activeCurve) === "comb") {
    for (const name of curveNamesForEffect("comb")) {
      if (name !== activeCurve) drawCurve(name, curves[name], curveColors[name], 2.1, false);
    }
    drawCurve(activeCurve, curves[activeCurve], curveColors[activeCurve], 4.8, true);
    return;
  }
  if (["flanger", "chorus", "delay"].includes(effectForCurve(activeCurve))) {
    const activeEffect = effectForCurve(activeCurve);
    for (const name of curveNamesForEffect(activeEffect)) {
      if (name !== activeCurve) drawCurve(name, curves[name], curveColors[name], 2.1, false);
    }
    drawCurve(activeCurve, curves[activeCurve], curveColors[activeCurve], 4.8, true);
    return;
  }
  drawCurve(activeCurve, curves[activeCurve], curveColors[activeCurve], 4.8, true);
}

function drawOutputWaveform() {
  const w = outputWaveCssWidth;
  const h = outputWaveCssHeight;
  const plotW = Math.max(1, w - axisWidth);
  const scale = window.devicePixelRatio || 1;
  outputWaveCtx.setTransform(scale, 0, 0, scale, 0, 0);
  outputWaveCtx.fillStyle = "#0c1f31";
  outputWaveCtx.fillRect(0, 0, w, h);

  outputWaveCtx.strokeStyle = "rgba(79, 121, 155, 0.28)";
  outputWaveCtx.lineWidth = 1;
  const divisions = plotW < 680 ? 4 : 10;
  for (let i = 0; i <= divisions; i += 1) {
    const x = axisWidth + (i / divisions) * plotW;
    outputWaveCtx.beginPath();
    outputWaveCtx.moveTo(x, 21);
    outputWaveCtx.lineTo(x, h - 19);
    outputWaveCtx.stroke();
  }

  outputWaveCtx.fillStyle = "#9bb4c9";
  outputWaveCtx.font = "11px sans-serif";
  outputWaveCtx.textBaseline = "middle";
  outputWaveCtx.fillText("OUTPUT TIME", 10, 12);
  const hintX = Math.max(axisWidth + 10, 18 + outputWaveCtx.measureText("OUTPUT TIME").width + 8);
  outputWaveCtx.fillText(w > 640 ? "SOURCE WAVEFORM · EFFECT TAIL NOT SHOWN" : "SOURCE", hintX, 12);

  if (!buffer || !waveform.length) return;
  const stereo = waveform.length > 1;
  const laneCenters = stereo ? [39, 63] : [51];
  outputWaveCtx.fillStyle = "rgba(146, 171, 190, 0.86)";
  for (let channel = 0; channel < waveform.length; channel += 1) {
    const peaks = waveform[channel];
    const mid = laneCenters[channel];
    for (let x = 0; x < plotW; x += 1) {
      const index = Math.min(peaks.length - 1, Math.floor(x / plotW * peaks.length));
      const amplitude = Math.min(stereo ? 10 : 22, (peaks[index] || 0) * 45);
      outputWaveCtx.fillRect(axisWidth + x, mid - amplitude, 1, Math.max(1, amplitude * 2));
    }
  }
  outputWaveCtx.fillStyle = "#9bb4c9";
  outputWaveCtx.fillText(stereo ? "L" : "MONO", 11, laneCenters[0]);
  if (stereo) outputWaveCtx.fillText("R", 11, laneCenters[1]);
  for (let i = 0; i <= divisions; i += 1) {
    outputWaveCtx.textAlign = i === 0 ? "left" : i === divisions ? "right" : "center";
    outputWaveCtx.fillText(formatTime(buffer.duration * i / divisions), axisWidth + (i / divisions) * plotW, h - 8);
  }
  outputWaveCtx.textAlign = "start";

  const markerColor = "#e6edf1";
  if (!isWaveSeeking && outputHoverProgress !== null) {
    const hoverX = axisWidth + outputHoverProgress * plotW;
    outputWaveCtx.save();
    outputWaveCtx.strokeStyle = markerColor;
    outputWaveCtx.lineWidth = 1.5;
    outputWaveCtx.setLineDash([3, 4]);
    outputWaveCtx.beginPath();
    outputWaveCtx.moveTo(hoverX, 21);
    outputWaveCtx.lineTo(hoverX, h - 19);
    outputWaveCtx.stroke();
    outputWaveCtx.restore();
  }

  const progress = Math.max(0, Math.min(1, playheadSeconds / buffer.duration));
  const cursorX = axisWidth + progress * plotW;
  outputWaveCtx.strokeStyle = markerColor;
  outputWaveCtx.lineWidth = 1.5;
  outputWaveCtx.beginPath();
  outputWaveCtx.moveTo(cursorX, 21);
  outputWaveCtx.lineTo(cursorX, h - 19);
  outputWaveCtx.stroke();
  outputWaveCtx.fillStyle = markerColor;
  outputWaveCtx.beginPath();
  outputWaveCtx.moveTo(cursorX - 5, 21);
  outputWaveCtx.lineTo(cursorX + 5, 21);
  outputWaveCtx.lineTo(cursorX, 28);
  outputWaveCtx.closePath();
  outputWaveCtx.moveTo(cursorX - 5, h - 19);
  outputWaveCtx.lineTo(cursorX + 5, h - 19);
  outputWaveCtx.lineTo(cursorX, h - 26);
  outputWaveCtx.closePath();
  outputWaveCtx.fill();
  outputWaveCanvas.setAttribute("aria-valuenow", String(Math.round(progress * 100)));
  outputWaveCanvas.setAttribute("aria-valuetext", `${formatClock(playheadSeconds)} of ${formatClock(buffer.duration)}`);
}

function draw() {
  const scale = window.devicePixelRatio || 1;
  const w = canvasCssWidth;
  const h = canvasCssHeight;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#0c1f31";
  ctx.fillRect(0, 0, w, h);

  const plotW = Math.max(1, w - axisWidth);
  ctx.strokeStyle = "rgba(63, 101, 132, 0.12)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 40; i += 1) {
    if (i % 4 === 0) continue;
    const x = axisWidth + ((i / 40) * plotW);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let i = 1; i < 8; i += 1) {
    if (i % 2 === 0) continue;
    const y = (i / 8) * h;
    ctx.beginPath();
    ctx.moveTo(axisWidth, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(79, 121, 155, 0.28)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 10; i += 1) {
    const x = axisWidth + ((i / 10) * plotW);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let i = 1; i < 4; i += 1) {
    const y = (i / 4) * h;
    ctx.beginPath();
    ctx.moveTo(axisWidth, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  const activeEffect = effectForCurve(activeCurve);
  if (activeCurve === "bandpassWidth") drawWidthAxis();
  else if (["comb", "flanger", "chorus", "delay"].includes(activeEffect)) drawValueAxis();
  else drawLowPassAxis();

  if (activeEffect && effects[activeEffect].enabled) {
    if (activeEffect === "bandpass") {
      drawBandPassFill();
    } else if (!["comb", "flanger", "chorus", "delay"].includes(activeEffect)) {
      drawFilterFill(activeCurve, curves[activeCurve], curveColors[activeCurve]);
    }
    drawCurves();
  }

  if (buffer) {
    const x = axisWidth + ((playheadSeconds / buffer.duration) * plotW);
    ctx.save();
    ctx.strokeStyle = "rgba(226, 236, 244, 0.86)";
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
    ctx.restore();
  }

  timeStatus.textContent = buffer ? `${formatClock(playheadSeconds)} / ${formatClock(buffer.duration)}` : "00:00.00 / 00:00.00";
  drawOutputWaveform();
  cutoffReadout.textContent = activeEffect && effects[activeEffect].enabled
    ? (
      activeEffect === "comb"
        ? formatCurrentCombValue(activeCurve)
        : (["flanger", "chorus", "delay"].includes(activeEffect)
          ? formatCurrentTimeEffectValue(activeCurve)
        : (activeCurve === "bandpassWidth" ? formatWidth(currentBandPassWidth) : formatCutoff(currentCutoffs[activeCurve]))
        )
    )
    : "--";
  modeReadout.textContent = activeCurve ? curveLabels[activeCurve] : "No Filter Selected";
  pointsReadout.textContent = activeCurve ? String(curves[activeCurve].length) : "0";
}

function buildWaveform(audioBuffer) {
  const buckets = 4000;
  waveform = Array.from({ length: Math.min(2, audioBuffer.numberOfChannels) }, (_, channelIndex) => {
    const channel = audioBuffer.getChannelData(channelIndex);
    const peaks = new Float32Array(buckets);
    for (let i = 0; i < buckets; i += 1) {
      let peak = 0;
      const start = Math.floor(i * channel.length / buckets);
      const end = Math.floor((i + 1) * channel.length / buckets);
      for (let j = start; j < end; j += 1) peak = Math.max(peak, Math.abs(channel[j]));
      peaks[i] = peak;
    }
    return peaks;
  });
}

function createWhiteNoiseIntervalBuffer(sampleRate) {
  const frameCount = Math.max(1, Math.floor(sampleNoiseDuration * sampleRate));
  const noiseFrames = Math.floor(sampleNoiseBurstSeconds * sampleRate);
  const gapFrames = Math.floor(sampleNoiseGapSeconds * sampleRate);
  const cycleFrames = Math.max(1, noiseFrames + gapFrames);
  const attackFrames = Math.max(1, Math.floor(sampleNoiseAttackSeconds * sampleRate));
  const decayFrames = Math.max(1, Math.floor(sampleNoiseDecaySeconds * sampleRate));
  const releaseFrames = Math.max(1, Math.floor(sampleNoiseReleaseSeconds * sampleRate));
  const audioBuffer = audioContext.createBuffer(2, frameCount, sampleRate);
  const left = audioBuffer.getChannelData(0);
  const right = audioBuffer.getChannelData(1);

  for (let i = 0; i < frameCount; i += 1) {
    const cyclePosition = i % cycleFrames;
    if (cyclePosition >= noiseFrames) continue;

    let envelope = sampleNoiseSustainLevel;
    if (cyclePosition < attackFrames) {
      envelope = cyclePosition / attackFrames;
    } else if (cyclePosition < attackFrames + decayFrames) {
      const decayPosition = (cyclePosition - attackFrames) / decayFrames;
      envelope = 1 - ((1 - sampleNoiseSustainLevel) * decayPosition);
    }

    const releasePosition = (noiseFrames - cyclePosition) / releaseFrames;
    envelope *= Math.max(0, Math.min(1, releasePosition));
    const sample = ((Math.random() * 2) - 1) * sampleNoiseGain * envelope;
    left[i] = sample;
    right[i] = sample;
  }

  return audioBuffer;
}

function useAudioBuffer(nextBuffer, label) {
  if (renderAbortController) {
    renderAbortController.abort();
    renderAbortController = null;
  }
  forceStopAudio();
  buffer = nextBuffer;
  buildWaveform(buffer);
  workletBufferLoaded = false;
  sendBufferToWorklet();
  fileStatus.textContent = `${label} - ${buffer.duration.toFixed(2)} s`;
  clearDownload();
  downloadReadout.textContent = "ready";
  playheadSeconds = 0;
  setTransportBusy(false);
  draw();
}

async function loadDefaultWhiteNoise() {
  try {
    if (!audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error("Web Audio is not available in this browser.");
      }
      audioContext = new AudioContextClass();
    }
    const noiseBuffer = createWhiteNoiseIntervalBuffer(audioContext.sampleRate);
    useAudioBuffer(noiseBuffer, "White noise intervals");
  } catch (error) {
    console.error(error);
    fileStatus.textContent = "Open an audio file to begin.";
    downloadReadout.textContent = "not ready";
    buffer = null;
    draw();
  }
}

function decodeAudioFile(arrayBuffer) {
  const data = arrayBuffer.slice(0);
  return new Promise((resolve, reject) => {
    const promise = audioContext.decodeAudioData(data, resolve, reject);
    if (promise?.then) promise.then(resolve).catch(reject);
  });
}

async function ensureAudio() {
  await ensureAudioContext();
  if (!node) {
    if (!audioSetupPromise) {
      audioSetupPromise = setupAudio().catch((error) => {
        audioContext = null;
        node = null;
        outputMeter = null;
        throw error;
      }).finally(() => {
        audioSetupPromise = null;
      });
    }
    await audioSetupPromise;
  }
  if (!workletBufferLoaded) sendBufferToWorklet();
}

async function setupAudio() {
  if (!audioContext) {
    await ensureAudioContext();
  }
  if (!audioContext.audioWorklet) {
    throw new Error("AudioWorklet is not available. Use a current Chrome, Edge, or Safari version over HTTPS.");
  }

    await audioContext.audioWorklet.addModule("src/timbre-worklet.js?v=20261006-phase-02");
    node = new AudioWorkletNode(audioContext, "timbre-filter-processor", {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [2]
    });
    outputMeter = new OutputMeterAnalyzer(audioContext, { channelCount: 2 });
    node.connect(outputMeter.input);
    outputMeter.connect(audioContext.destination);
    startMeterAnimation();
    node.port.onmessage = (event) => {
      if (!isCurrentPlaybackMessage(event.data)) return;
      if (event.data.type === "position") {
        if (!isWaveSeeking) playheadSeconds = event.data.seconds;
        currentCutoffs.lowpass = event.data.lowPassCutoff;
        currentCutoffs.highpass = event.data.highPassCutoff;
        currentCutoffs.bandpassCenter = event.data.bandPassCenter;
        currentBandPassQ = event.data.bandPassQ;
        currentBandPassWidth = event.data.bandPassWidth;
        currentComb.delayMs = event.data.combDelayMs;
        currentComb.feedback = event.data.combFeedback;
        currentComb.mix = event.data.combMix;
        currentFlanger.delayMs = event.data.flangerDelayMs;
        currentFlanger.depthMs = event.data.flangerDepthMs;
        currentFlanger.rateHz = event.data.flangerRateHz;
        currentFlanger.feedback = event.data.flangerFeedback;
        currentChorus.delayMs = event.data.chorusDelayMs;
        currentChorus.depthMs = event.data.chorusDepthMs;
        currentChorus.rateHz = event.data.chorusRateHz;
        currentChorus.mix = event.data.chorusMix;
        currentDelay.timeMs = event.data.delayTimeMs;
        currentDelay.feedback = event.data.delayFeedback;
        currentDelay.mix = event.data.delayMix;
        draw();
      } else if (event.data.type === "ended") {
        playButton.textContent = "Play";
        isPlaying = false;
        playheadSeconds = 0;
        node?.port.postMessage({ type: "seek", seconds: 0, token: playbackToken });
        draw();
      } else if (event.data.type === "stopped") {
        playButton.textContent = "Play";
        isPlaying = false;
        playheadSeconds = 0;
        draw();
      }
    };
    sendBufferToWorklet();
    sendSettings();
    sendCurves();
}

async function loadAudioFile(file) {
  if (!file) return;
  if (renderAbortController) {
    renderAbortController.abort();
    renderAbortController = null;
  }
  setTransportBusy(true);
  fileStatus.textContent = `Loading ${file.name}...`;
  downloadReadout.textContent = "loading";
  playButton.textContent = "Play";
  isPlaying = false;
  node?.port.postMessage({ type: "stop", reset: true, token: nextPlaybackToken() });
  try {
    await ensureAudioContext();
    const data = await file.arrayBuffer();
    buffer = await decodeAudioFile(data);
    buildWaveform(buffer);
    workletBufferLoaded = false;
    sendBufferToWorklet();
    const longFileNote = buffer.duration > largeFileSeconds ? " - long file" : "";
    fileStatus.textContent = `${file.name} - ${buffer.duration.toFixed(2)} s${longFileNote}`;
    clearDownload();
    downloadReadout.textContent = buffer.duration > largeFileSeconds ? "export limit: 180 s" : "ready";
    playheadSeconds = 0;
    draw();
  } catch (error) {
    console.error(error);
    fileStatus.textContent = "Could not load audio. Try WAV, MP3, or M4A.";
    downloadReadout.textContent = "not ready";
    buffer = null;
    waveform = [];
    playheadSeconds = 0;
    draw();
  } finally {
    setTransportBusy(false);
  }
}

fileInput.addEventListener("change", async () => {
  await loadAudioFile(fileInput.files?.[0]);
  fileInput.value = "";
});

playButton.addEventListener("click", playAudio);

stopButton.addEventListener("click", stopAudio);

function seekToOutputTime(seconds) {
  if (!buffer || outputWaveCanvas.getAttribute("aria-disabled") === "true") return;
  playheadSeconds = Math.max(0, Math.min(buffer.duration, seconds));
  node?.port.postMessage({ type: "seek", seconds: playheadSeconds, token: playbackToken });
  draw();
}

function outputProgressFromPointer(event) {
  const rect = outputWaveCanvas.getBoundingClientRect();
  return Math.max(0, Math.min(1, (event.clientX - rect.left - axisWidth) / Math.max(1, rect.width - axisWidth)));
}

outputWaveCanvas.addEventListener("pointerdown", (event) => {
  if (event.button !== 0 || !buffer || outputWaveCanvas.getAttribute("aria-disabled") === "true") return;
  event.preventDefault();
  isWaveSeeking = true;
  outputHoverProgress = null;
  outputWaveCanvas.setPointerCapture(event.pointerId);
  seekToOutputTime(outputProgressFromPointer(event) * buffer.duration);
});

outputWaveCanvas.addEventListener("pointermove", (event) => {
  if (!buffer) return;
  if (isWaveSeeking) {
    seekToOutputTime(outputProgressFromPointer(event) * buffer.duration);
    return;
  }
  const rect = outputWaveCanvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  outputHoverProgress = event.pointerType !== "touch" && x >= axisWidth && x <= rect.width && y >= 0 && y <= rect.height
    ? outputProgressFromPointer(event) : null;
  drawOutputWaveform();
});

function endWaveSeek(event) {
  isWaveSeeking = false;
  outputHoverProgress = null;
  if (outputWaveCanvas.hasPointerCapture(event.pointerId)) outputWaveCanvas.releasePointerCapture(event.pointerId);
  drawOutputWaveform();
}

outputWaveCanvas.addEventListener("pointerup", endWaveSeek);
outputWaveCanvas.addEventListener("pointercancel", endWaveSeek);
outputWaveCanvas.addEventListener("pointerleave", () => {
  outputHoverProgress = null;
  drawOutputWaveform();
});

outputWaveCanvas.addEventListener("keydown", (event) => {
  if (!buffer) return;
  let nextSeconds = playheadSeconds;
  if (event.key === "ArrowLeft") nextSeconds -= event.shiftKey ? 0.1 : 1;
  else if (event.key === "ArrowRight") nextSeconds += event.shiftKey ? 0.1 : 1;
  else if (event.key === "Home") nextSeconds = 0;
  else if (event.key === "End") nextSeconds = buffer.duration;
  else return;
  event.preventDefault();
  seekToOutputTime(nextSeconds);
});

meterClipButton.addEventListener("click", () => {
  meterClipLatched = false;
  meterClipButton.classList.remove("clipped");
  meterClipButton.setAttribute("aria-pressed", "false");
});

downloadButton.addEventListener("click", async () => {
  if (!buffer) return;
  if (renderAbortController) {
    renderAbortController.abort();
    return;
  }

  if (isPlaying) {
    forceStopAudio();
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  renderAbortController = new AbortController();
  setRenderBusy(true);
  downloadReadout.textContent = "creating 0%";
  downloadButton.textContent = "Cancel";
  clearDownload();

  try {
    const render = await getOfflineRenderer();
    const rendered = await render({
      includePCM: false,
      audioBuffer: buffer,
      curves,
      settings: getSettings(),
      signal: renderAbortController.signal,
      onProgress: (progress) => {
        downloadReadout.textContent = `creating ${Math.round(progress * 100)}%`;
      }
    });

    downloadUrl = URL.createObjectURL(rendered.blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = "TimbreCurveLab-export.wav";
    document.body.appendChild(link);
    link.click();
    link.remove();
    downloadReadout.textContent = rendered.truncated
      ? `${rendered.duration.toFixed(1)} s, capped`
      : `${rendered.duration.toFixed(1)} s`;
  } catch (error) {
    if (error.name === "AbortError") {
      downloadReadout.textContent = "cancelled";
    } else if (error.code === "EXPORT_DURATION_LIMIT") {
      downloadReadout.textContent = error.message;
    } else {
      console.error(error);
      downloadReadout.textContent = "export failed";
    }
  } finally {
    renderAbortController = null;
    downloadButton.textContent = "Download WAV";
    setRenderBusy(false);
  }
});

resetButton.addEventListener("click", () => {
  const shouldReset = window.confirm("Reset all curves and filter states?");
  if (!shouldReset) return;

  forceStopAudio();
  for (const name of Object.keys(curves)) {
    curves[name] = defaultCurves[name]();
    editedCurves[name] = false;
  }
  effects.lowpass.enabled = false;
  effects.highpass.enabled = false;
  effects.bandpass.enabled = false;
  effects.comb.enabled = false;
  effects.flanger.enabled = false;
  effects.chorus.enabled = false;
  effects.delay.enabled = false;
  chainOrder = [];
  activeCurve = null;
  selectedPoint = null;
  hoveredPoint = null;
  markDownloadStale();
  sendCurves();
  sendSettings();
  updateEffectButtons();
  draw();
});

clearCurveButton.addEventListener("click", () => {
  if (!activeCurve) return;
  forceStopAudio();
  curves[activeCurve] = defaultCurves[activeCurve]();
  editedCurves[activeCurve] = false;
  selectedPoint = null;
  hoveredPoint = null;
  markDownloadStale();
  sendCurves();
  draw();
});

function setActiveCurve(name) {
  activeCurve = name;
  updateEffectButtons();
  draw();
}

function updateEffectButtons() {
  const activeEffect = effectForCurve(activeCurve);
  lowpassMode.classList.toggle("enabled", effects.lowpass.enabled);
  lowpassMode.classList.toggle("bypassed", !effects.lowpass.enabled);
  lowpassMode.classList.toggle("active", activeEffect === "lowpass");
  lowpassMode.setAttribute("aria-pressed", String(effects.lowpass.enabled));
  lowpassMode.title = effects.lowpass.enabled ? "Low Pass is active" : "Low Pass is bypassed";

  highpassMode.classList.toggle("enabled", effects.highpass.enabled);
  highpassMode.classList.toggle("bypassed", !effects.highpass.enabled);
  highpassMode.classList.toggle("active", activeEffect === "highpass");
  highpassMode.setAttribute("aria-pressed", String(effects.highpass.enabled));
  highpassMode.title = effects.highpass.enabled ? "High Pass is active" : "High Pass is bypassed";

  bandpassMode.classList.toggle("enabled", effects.bandpass.enabled);
  bandpassMode.classList.toggle("bypassed", !effects.bandpass.enabled);
  bandpassMode.classList.toggle("active", activeEffect === "bandpass");
  bandpassMode.setAttribute("aria-pressed", String(effects.bandpass.enabled));
  bandpassMode.title = effects.bandpass.enabled ? "Band Pass is active" : "Band Pass is bypassed";

  combMode.classList.toggle("enabled", effects.comb.enabled);
  combMode.classList.toggle("bypassed", !effects.comb.enabled);
  combMode.classList.toggle("active", activeEffect === "comb");
  combMode.setAttribute("aria-pressed", String(effects.comb.enabled));
  combMode.title = effects.comb.enabled ? "Comb is active" : "Comb is bypassed";

  flangerMode.classList.toggle("enabled", effects.flanger.enabled);
  flangerMode.classList.toggle("bypassed", !effects.flanger.enabled);
  flangerMode.classList.toggle("active", activeEffect === "flanger");
  flangerMode.setAttribute("aria-pressed", String(effects.flanger.enabled));
  flangerMode.title = effects.flanger.enabled ? "Flanger is active" : "Flanger is bypassed";

  chorusMode.classList.toggle("enabled", effects.chorus.enabled);
  chorusMode.classList.toggle("bypassed", !effects.chorus.enabled);
  chorusMode.classList.toggle("active", activeEffect === "chorus");
  chorusMode.setAttribute("aria-pressed", String(effects.chorus.enabled));
  chorusMode.title = effects.chorus.enabled ? "Chorus is active" : "Chorus is bypassed";

  delayMode.classList.toggle("enabled", effects.delay.enabled);
  delayMode.classList.toggle("bypassed", !effects.delay.enabled);
  delayMode.classList.toggle("active", activeEffect === "delay");
  delayMode.setAttribute("aria-pressed", String(effects.delay.enabled));
  delayMode.title = effects.delay.enabled ? "Delay is active" : "Delay is bypassed";

  const showsBandParams = activeEffect === "bandpass";
  const showsCombParams = activeEffect === "comb";
  const showsFlangerParams = activeEffect === "flanger";
  const showsChorusParams = activeEffect === "chorus";
  const showsDelayParams = activeEffect === "delay";
  clearCurveButton.disabled = !activeCurve;
  parameterBar.hidden = !showsBandParams && !showsCombParams && !showsFlangerParams && !showsChorusParams && !showsDelayParams;
  bandpassCenterParam.hidden = !showsBandParams;
  bandpassWidthParam.hidden = !showsBandParams;
  combDelayParam.hidden = !showsCombParams;
  combFeedbackParam.hidden = !showsCombParams;
  combMixParam.hidden = !showsCombParams;
  flangerDelayParam.hidden = !showsFlangerParams;
  flangerDepthParam.hidden = !showsFlangerParams;
  flangerRateParam.hidden = !showsFlangerParams;
  flangerFeedbackParam.hidden = !showsFlangerParams;
  chorusDelayParam.hidden = !showsChorusParams;
  chorusDepthParam.hidden = !showsChorusParams;
  chorusRateParam.hidden = !showsChorusParams;
  chorusMixParam.hidden = !showsChorusParams;
  delayTimeParam.hidden = !showsDelayParams;
  delayFeedbackParam.hidden = !showsDelayParams;
  delayMixParam.hidden = !showsDelayParams;
  bandpassCenterParam.classList.toggle("active", activeCurve === "bandpassCenter");
  bandpassWidthParam.classList.toggle("active", activeCurve === "bandpassWidth");
  combDelayParam.classList.toggle("active", activeCurve === "combDelay");
  combFeedbackParam.classList.toggle("active", activeCurve === "combFeedback");
  combMixParam.classList.toggle("active", activeCurve === "combMix");
  flangerDelayParam.classList.toggle("active", activeCurve === "flangerDelay");
  flangerDepthParam.classList.toggle("active", activeCurve === "flangerDepth");
  flangerRateParam.classList.toggle("active", activeCurve === "flangerRate");
  flangerFeedbackParam.classList.toggle("active", activeCurve === "flangerFeedback");
  chorusDelayParam.classList.toggle("active", activeCurve === "chorusDelay");
  chorusDepthParam.classList.toggle("active", activeCurve === "chorusDepth");
  chorusRateParam.classList.toggle("active", activeCurve === "chorusRate");
  chorusMixParam.classList.toggle("active", activeCurve === "chorusMix");
  delayTimeParam.classList.toggle("active", activeCurve === "delayTime");
  delayFeedbackParam.classList.toggle("active", activeCurve === "delayFeedback");
  delayMixParam.classList.toggle("active", activeCurve === "delayMix");
  renderParameterLegend();
  renderChainDiagram();
}

function toggleEffect(name) {
  effects[name].enabled = !effects[name].enabled;
  if (effects[name].enabled) addEffectToChain(name);
  else {
    removeEffectFromChain(name);
    if (effectForCurve(activeCurve) === name) activeCurve = null;
  }
  markDownloadStale();
  sendSettings();
  updateEffectButtons();
  draw();
}

function handleEffectClick(name) {
  const currentEffect = effectForCurve(activeCurve);
  if (currentEffect === name) {
    toggleEffect(name);
    return;
  }

  if (!effects[name].enabled) {
    effects[name].enabled = true;
    addEffectToChain(name);
    markDownloadStale();
    sendSettings();
  }
  activeCurve = defaultCurveForEffect(name);
  updateEffectButtons();
  draw();
}

lowpassMode.addEventListener("click", () => {
  handleEffectClick("lowpass");
});

highpassMode.addEventListener("click", () => {
  handleEffectClick("highpass");
});

bandpassMode.addEventListener("click", () => {
  handleEffectClick("bandpass");
});

combMode.addEventListener("click", () => {
  handleEffectClick("comb");
});

flangerMode.addEventListener("click", () => {
  handleEffectClick("flanger");
});

chorusMode.addEventListener("click", () => {
  handleEffectClick("chorus");
});

delayMode.addEventListener("click", () => {
  handleEffectClick("delay");
});

bandpassCenterParam.addEventListener("click", () => {
  setActiveCurve("bandpassCenter");
});

bandpassWidthParam.addEventListener("click", () => {
  setActiveCurve("bandpassWidth");
});

combDelayParam.addEventListener("click", () => {
  setActiveCurve("combDelay");
});

combFeedbackParam.addEventListener("click", () => {
  setActiveCurve("combFeedback");
});

combMixParam.addEventListener("click", () => {
  setActiveCurve("combMix");
});

flangerDelayParam.addEventListener("click", () => {
  setActiveCurve("flangerDelay");
});

flangerDepthParam.addEventListener("click", () => {
  setActiveCurve("flangerDepth");
});

flangerRateParam.addEventListener("click", () => {
  setActiveCurve("flangerRate");
});

flangerFeedbackParam.addEventListener("click", () => {
  setActiveCurve("flangerFeedback");
});

chorusDelayParam.addEventListener("click", () => {
  setActiveCurve("chorusDelay");
});

chorusDepthParam.addEventListener("click", () => {
  setActiveCurve("chorusDepth");
});

chorusRateParam.addEventListener("click", () => {
  setActiveCurve("chorusRate");
});

chorusMixParam.addEventListener("click", () => {
  setActiveCurve("chorusMix");
});

delayTimeParam.addEventListener("click", () => {
  setActiveCurve("delayTime");
});

delayFeedbackParam.addEventListener("click", () => {
  setActiveCurve("delayFeedback");
});

delayMixParam.addEventListener("click", () => {
  setActiveCurve("delayMix");
});

updateEffectButtons();
sendSettings();

function pointerToScreenPosition(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}

function pointerToPoint(event) {
  const rect = canvas.getBoundingClientRect();
  const axisRatio = axisWidth / Math.max(1, canvasCssWidth);
  const x = Math.max(0, Math.min(1, (((event.clientX - rect.left) / rect.width) - axisRatio) / Math.max(0.001, 1 - axisRatio)));
  let y = Math.max(0, Math.min(1, 1 - ((event.clientY - rect.top) / rect.height)));
  if (activeCurve === "bandpassWidth") {
    const centerY = valueAt(curves.bandpassCenter, x);
    const distance = Math.abs(y - centerY);
    const distanceToEdge = y >= centerY ? 1 - centerY : centerY;
    y = Math.max(0, Math.min(1, distance / Math.max(0.001, distanceToEdge)));
  }
  return { x, y };
}

function findPointNearScreen(screenPosition, curve, name = activeCurve) {
  const hitRadius = 18;
  return curve.findIndex((curvePoint) => (
    Math.hypot(
      pointScreenPosition(name, curvePoint).x - screenPosition.x,
      pointScreenPosition(name, curvePoint).y - screenPosition.y
    ) < hitRadius
  ));
}

function isErasing(event) {
  return selectedTool === "eraser" || Boolean(event?.[eraseModifier]);
}

function updateEraseCursor(event) {
  canvas.classList.toggle("eraseMode", isErasing(event));
}

function setTool(tool) {
  selectedTool = tool;
  penTool.classList.toggle("active", tool === "pen");
  eraserTool.classList.toggle("active", tool === "eraser");
  penTool.setAttribute("aria-pressed", String(tool === "pen"));
  eraserTool.setAttribute("aria-pressed", String(tool === "eraser"));
  selectedPoint = null;
  dragging = false;
  updateEraseCursor();
  draw();
}

penTool.addEventListener("click", () => setTool("pen"));
eraserTool.addEventListener("click", () => setTool("eraser"));

canvas.addEventListener("pointerdown", (event) => {
  if (event.button !== 0) return;
  if (!activeCurve) return;
  if (!effects[effectForCurve(activeCurve)].enabled) return;
  const p = pointerToPoint(event);
  const curve = curves[activeCurve];
  selectedPoint = findPointNearScreen(pointerToScreenPosition(event), curve);
  if (isErasing(event)) {
    event.preventDefault();
    if (selectedPoint > 0 && selectedPoint < curve.length - 1) {
      curve.splice(selectedPoint, 1);
      selectedPoint = null;
      hoveredPoint = null;
      editedCurves[activeCurve] = true;
      sendCurves();
      draw();
    }
    return;
  }
  if (selectedPoint < 0) {
    curve.push(p);
    sortCurve(curve);
    selectedPoint = curve.indexOf(p);
  }
  hoveredPoint = selectedPoint;
  editedCurves[activeCurve] = true;
  dragging = true;
  canvas.setPointerCapture(event.pointerId);
  sendCurves();
  draw();
});

canvas.addEventListener("pointermove", (event) => {
  updateEraseCursor(event);
  if (!activeCurve) return;
  const p = pointerToPoint(event);
  const curve = curves[activeCurve];
  if (!effects[effectForCurve(activeCurve)].enabled) {
    if (hoveredPoint != null) {
      hoveredPoint = null;
      draw();
    }
    return;
  }
  if (!dragging || selectedPoint == null) {
    const nextHoveredPoint = findPointNearScreen(pointerToScreenPosition(event), curve);
    if (nextHoveredPoint !== hoveredPoint) {
      hoveredPoint = nextHoveredPoint;
      draw();
    }
    return;
  }
  const point = curve[selectedPoint];
  point.x = p.x;
  point.y = p.y;
  editedCurves[activeCurve] = true;
  sortCurve(curve);
  selectedPoint = curve.indexOf(point);
  hoveredPoint = selectedPoint;
  sendCurves();
  draw();
});

canvas.addEventListener("pointerup", (event) => {
  dragging = false;
  selectedPoint = null;
  hoveredPoint = null;
  canvas.releasePointerCapture(event.pointerId);
  draw();
});

canvas.addEventListener("pointerleave", () => {
  if (dragging) return;
  hoveredPoint = null;
  draw();
});

canvas.addEventListener("pointerenter", updateEraseCursor);

window.addEventListener("keydown", updateEraseCursor);
window.addEventListener("keyup", updateEraseCursor);
window.addEventListener("blur", () => updateEraseCursor());

window.addEventListener("resize", resizeCanvas);
if ("ResizeObserver" in window) {
  const canvasResizeObserver = new ResizeObserver(resizeCanvas);
  canvasResizeObserver.observe(canvas);
}

window.addEventListener("keydown", (event) => {
  const target = event.target;
  const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable;
  if (event.code !== "Space" || isTyping || event.repeat || !buffer) return;
  event.preventDefault();
  event.stopPropagation();
  if (document.activeElement instanceof HTMLButtonElement) {
    document.activeElement.blur();
  }
  toggleAudio();
});

window.addEventListener("keyup", (event) => {
  const target = event.target;
  const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable;
  if (event.code !== "Space" || isTyping) return;
  event.preventDefault();
  event.stopPropagation();
});

resizeCanvas();
loadDefaultWhiteNoise();
