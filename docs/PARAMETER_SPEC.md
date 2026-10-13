# Parameter Specification

Version: 1.0 documentation baseline  
Curve domain: normalized time `x in [0,1]`, normalized value `y in [0,1]`  
Interpolation: smoothstep, `s(t) = t^2(3 - 2t)`, for all curves

The table records current product behavior. Defaults are the musical-unit values represented by the initial two endpoint curves.

## User Parameters

| Parameter ID | Display name | Module | Unit | Range | Default | Mapping | Smoothing |
|---|---|---|---|---|---|---|---|
| `lowpass` | Low Pass | Low Pass | Hz | 40 to min(18,000, 0.45 x sample rate) | 800 Hz | Log | None beyond curve interpolation |
| `highpass` | High Pass | High Pass | Hz | 40 to min(18,000, 0.45 x sample rate) | 900 Hz | Log | None beyond curve interpolation |
| `bandpassCenter` | Center Frequency | Band Pass | Hz | 40 to min(18,000, 0.45 x sample rate) | 1.5 kHz | Log | None beyond curve interpolation |
| `bandpassWidth` | Width | Band Pass | normalized / Q | 0 narrow to 1 wide; Q 12 to 0.5 | about 0.436 / Q 3 | Custom inverse exponential | None |
| `combDelay` | Delay Time | Comb | ms | 0.5-100 | 4 | Log | Per-sample coefficient 0.0025 |
| `combFeedback` | Feedback | Comb | ratio | 0-0.95 | 0.72 | Linear | None |
| `combMix` | Amount | Comb | percent | 0-100 | 85 | Linear | None |
| `flangerDelay` | Delay Time | Flanger | ms | 0.5-10 | 3 | Log | Per-sample coefficient 0.0015 |
| `flangerDepth` | Depth | Flanger | ms | 0-10 | 2.5 | Linear | None |
| `flangerRate` | Rate | Flanger | Hz | 0.02-5 | 0.25 | Log | Continuous LFO phase |
| `flangerFeedback` | Feedback | Flanger | ratio | 0-0.85 | 0.60 | Linear | None |
| `flangerMix` | Mix | Flanger | percent | 0-100 | 50 | Linear | Curve interpolation |
| `chorusDelay` | Delay Time | Chorus | ms | 10-35 | 22 | Linear | Per-sample coefficient 0.0015 |
| `chorusDepth` | Depth | Chorus | ms | 0-20 | 4 | Linear | None |
| `chorusRate` | Rate | Chorus | Hz | 0.02-3 | 0.80 | Log | Continuous LFO phase |
| `chorusMix` | Mix | Chorus | percent | 0-100 | 50 | Linear | None |
| `delayTime` | Delay Time | Delay | ms | 100-1500 | 320 | Linear | Per-sample coefficient 0.0008 |
| `delayFeedback` | Feedback | Delay | ratio | 0-0.85 | 0.45 | Linear | None |
| `delayMix` | Mix | Delay | percent | 0-100 | 40 | Linear | None |

All parameters support curves and automation over source-normalized time. Preview and Render currently implement the same ranges, mappings, interpolation, and delay smoothing values in separate files.

## Mapping Equations

Let `y` be clamped to `[0,1]`.

- Cutoff/Center: `40 * (maxHz / 40)^y`, where `maxHz = min(18000, sampleRate * 0.45)`.
- Band Q: `0.5 * 24^(1-y)`. The entire range remains a band-pass filter; no Width value bypasses it. Center-frequency gain is unity.
- Comb Delay: `0.5 * (100 / 0.5)^y` milliseconds.
- Comb Feedback: `0.95y`.
- Flanger Delay: `0.5 * (10 / 0.5)^y` milliseconds.
- Flanger Depth: `10y` milliseconds.
- Flanger Rate: `0.02 * (5 / 0.02)^y` Hz.
- Flanger/Delay Feedback: `0.85y`.
- Chorus Delay: `10 + 25y` milliseconds.
- Chorus Depth: `20y` milliseconds.
- Chorus Rate: `0.02 * (3 / 0.02)^y` Hz.
- Mix: `y`.
- Delay Time: `100 + 1400y` milliseconds.

## Internal Processing Values

| ID | Purpose | Current value | Notes |
|---|---|---|---|
| `outputGain` | Common output headroom | 0.95 | Applied before limiter in Preview and Render |
| `filterQ` | Low/High Pass resonance | 0.71 | Fixed, not exposed |
| `combDamping` | Feedback brightness control | 0.22 | One-pole state update coefficient |
| `flangerDamping` | Feedback brightness control | 0.35 | One-pole state update coefficient |
| `delayDamping` | Echo brightness control | 0.22 | Internal; Tone control intentionally absent |
| `limiterThreshold` | Soft limiting knee | 0.92 | Always active in both engines |
| `limiterInputClamp` | Finite extreme-value defense | +/-2 | `NaN`/`Infinity` are not explicitly replaced |
| `limiterOutputClamp` | Final safety bound | +/-0.995 | Preview and Render |
| `sourceExportCap` | Maximum processed source | 180 s | Tail may extend result |
| `delayTailCap` | Maximum rendered echo tail | 10 s | Computed from max Delay curves |

The delay smoothing values above are per-sample coefficients, not fixed millisecond constants. Their approximate one-pole time constants are:

| Coefficient | About 44.1 kHz | About 48 kHz | Current use |
|---|---:|---:|---|
| `0.0025` | 9.1 ms | 8.3 ms | Comb Delay Time |
| `0.0015` | 15.1 ms | 13.9 ms | Flanger/Chorus base Delay Time |
| `0.0008` | 28.3 ms | 26.0 ms | Delay Time |

The relation is `tau = -1 / (sampleRate * ln(1 - coefficient))`. A native engine must either preserve the coefficient exactly or deliberately preserve the time constant across sample rates; these are not identical choices.

Current state initialization also begins Flanger at 3 ms, Chorus at 18 ms, and Delay at 350 ms before smoothing toward the selected/default curve values. This creates a short startup movement. Its musical necessity is `TO BE VERIFIED` before standalone implementation.

## Perceptual And Musical Notes

### Frequency controls

- **Useful range:** Source dependent; the logarithmic mapping intentionally gives octaves comparable visual space.
- **Extreme behavior:** 40 Hz can remove most audible content in Low Pass; high High-Pass values can leave only bright residue. Maximum is kept below Nyquist for stability.
- **Audible artifacts:** Very fast filter curves have no additional coefficient smoothing and require further listening validation.

### Band Width

- `0` is narrow (Q 12), with unity center-frequency gain.
- Increasing Width lowers Q and broadens the audible band.
- `1.00 wide` gives Q 0.5 and remains filtered. Use the effect Off control for bypass.

### Delay-based effects

- Comb uses the shortest and widest delay-time range, so pitch-like metallic colors and flanger-like transitions are expected.
- Flanger is centered on sub-10 ms moving delays; Depth and Rate define the sweep.
- Chorus begins at 10 ms to favor doubling over a sharp comb impression.
- Delay begins at 100 ms so the minimum is more likely to be perceived as an echo than a comb filter.
- Feedback limits are protective design bounds. Extreme combinations still require listening at safe monitoring levels.

## Fine-Tuning Status

Current values are extracted from the implementation and prior approved product behavior. Formal listening records, monitoring environment, sweet spots for different source classes, and dated perceptual verification are `TO BE DOCUMENTED`. Do not invent them from these numeric defaults.

### Future listening question: high-frequency liveliness

- Preserve the current clean, moist, and musically convincing character as the comparison baseline.
- Investigate whether feedback damping, fractional-delay interpolation, wet/dry balance, or final safety processing reduces high-frequency saturation, surface grain, transient edge, or perceived liveliness.
- Do not treat this as a confirmed defect or solve it by simply boosting treble.
- First experiment: A/B a small reduction of feedback-path damping while leaving all other values unchanged.
- Evaluate Comb, Flanger, Chorus, and Delay separately with noise, percussion, harmonic instruments, and ordinary music before accepting an engine change.
- Record every accepted or rejected experiment in `FINE_TUNING_LOG.md`; do not replace this baseline from memory alone.

## Standalone Mapping

Retain IDs, normalized ranges, equations, defaults, interpolation, smoothing coefficients, explicit effect bypass, and sample-rate cutoff cap. Native UI resolution may differ, but saved normalized values must produce the same musical-unit targets.

## Character starting values — 2026-10-13
See [research and preset contract](CHARACTER_PRESETS_2026-10-13.md). New/default and Clear Current/Reset All curves use these values. Effects remain Off at launch; toggling an effect does not overwrite edited curves. Missing Flanger Mix in older curve payloads retains 54% wet. MIX 100% is delayed-only and does not mean maximum comb cancellation.

Comb Amount retains the ID `combMix`. It blends original input with the comb
result `(input + delayed)/2`, not with delayed-only audio. 100% Amount still
contains the original component. Default remains 85%; feedback is independent.

## Delay / Depth limits — 2026-10-13
Flanger and Chorus now limit the effective sine amplitude to the smoothed Delay
minus the minimum read delay (.25 ms / 5 ms). They no longer clip the bottom
of the LFO sweep for excessive Depth. Requested values and defaults remain;
limited values show requested → effective depth in the readout.
[Contract, compatibility and verification](MODULATION_DEPTH_2026-10-13.md).
