# Parameter Specification

Version: 1.0 documentation baseline  
Curve domain: normalized time `x in [0,1]`, normalized value `y in [0,1]`  
Interpolation: smoothstep, `s(t) = t^2(3 - 2t)`, for all curves

The table records current product behavior. Defaults are the musical-unit values represented by the initial two endpoint curves.

## User Parameters

| Parameter ID | Display name | Module | Unit | Range | Default | Mapping | Smoothing |
|---|---|---|---|---|---|---|---|
| `lowpass` | Low Pass | Low Pass | Hz | 40 to min(18,000, 0.45 x sample rate) | about 1.0 kHz | Log | None beyond curve interpolation |
| `highpass` | High Pass | High Pass | Hz | 40 to min(18,000, 0.45 x sample rate) | about 400 Hz | Log | None beyond curve interpolation |
| `bandpassCenter` | Center Frequency | Band Pass | Hz | 40 to min(18,000, 0.45 x sample rate) | about 1.2 kHz | Log | None beyond curve interpolation |
| `bandpassWidth` | Width | Band Pass | normalized / Q | 0 narrow to 1 full; Q 12 to 0.5 | 0 / Q 12 | Custom inverse exponential | None |
| `combDelay` | Delay Time | Comb | ms | 0.5-100 | about 8 | Log | Per-sample coefficient 0.0025 |
| `combFeedback` | Feedback | Comb | ratio | 0-0.95 | 0.80 | Linear | None |
| `combMix` | Mix | Comb | percent | 0-100 | 90 | Linear | None |
| `flangerDelay` | Delay Time | Flanger | ms | 0.5-10 | about 2 | Log | Per-sample coefficient 0.0015 |
| `flangerDepth` | Depth | Flanger | ms | 0-10 | 6 | Linear | None |
| `flangerRate` | Rate | Flanger | Hz | 0.02-5 | about 0.30 | Log | Continuous LFO phase |
| `flangerFeedback` | Feedback | Flanger | ratio | 0-0.85 | 0.65 | Linear | None |
| `chorusDelay` | Delay Time | Chorus | ms | 10-35 | 22 | Linear | Per-sample coefficient 0.0015 |
| `chorusDepth` | Depth | Chorus | ms | 0-20 | 10 | Linear | None |
| `chorusRate` | Rate | Chorus | Hz | 0.02-3 | about 0.65 | Log | Continuous LFO phase |
| `chorusMix` | Mix | Chorus | percent | 0-100 | 55 | Linear | None |
| `delayTime` | Delay Time | Delay | ms | 100-1500 | about 420 | Linear | Per-sample coefficient 0.0008 |
| `delayFeedback` | Feedback | Delay | ratio | 0-0.85 | 0.48 | Linear | None |
| `delayMix` | Mix | Delay | percent | 0-100 | 42 | Linear | None |

All parameters support curves and automation over source-normalized time. Preview and Render currently implement the same ranges, mappings, interpolation, and delay smoothing values in separate files.

## Mapping Equations

Let `y` be clamped to `[0,1]`.

- Cutoff/Center: `40 * (maxHz / 40)^y`, where `maxHz = min(18000, sampleRate * 0.45)`.
- Band Q: `0.5 * 24^(1-y)`. Values `y >= 0.995` are treated as full-band bypass.
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
| `limiterInputClamp` | Invalid/extreme defense | +/-2 | Non-finite values become zero |
| `limiterOutputClamp` | Final safety bound | +/-0.995 | Preview and Render |
| `sourceExportCap` | Maximum processed source | 180 s | Tail may extend result |
| `delayTailCap` | Maximum rendered echo tail | 10 s | Computed from max Delay curves |

## Perceptual And Musical Notes

### Frequency controls

- **Useful range:** Source dependent; the logarithmic mapping intentionally gives octaves comparable visual space.
- **Extreme behavior:** 40 Hz can remove most audible content in Low Pass; high High-Pass values can leave only bright residue. Maximum is kept below Nyquist for stability.
- **Audible artifacts:** Very fast filter curves have no additional coefficient smoothing and require further listening validation.

### Band Width

- `0` is narrow and resonant (Q 12).
- Increasing Width lowers Q and broadens the audible band.
- `1.00 full` bypasses Band Pass so all frequencies pass. This is a product behavior, not merely a display label.

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

## Standalone Mapping

Retain IDs, normalized ranges, equations, defaults, interpolation, smoothing coefficients, bypass threshold, and sample-rate cutoff cap. Native UI resolution may differ, but saved normalized values must produce the same musical-unit targets.
