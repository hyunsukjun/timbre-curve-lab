# Standalone Migration Notes

## Goal

Reproduce Timbre Curve Lab's musical behavior and compact workflow on another platform. Reusing JavaScript is optional; preserving parameter identity, curves, processing order, mappings, fine tuning, and interaction meaning is mandatory.

No native framework, plugin format, or implementation language is selected by this document.

## Portable Product Data

- Product ID: `TimbreCurveLab` (canonical future serialization spelling remains to be approved).
- Effect IDs: `lowpass`, `highpass`, `bandpass`, `comb`, `flanger`, `chorus`, `delay`.
- Parameter IDs: all 18 IDs in `PARAMETER_SPEC.md`.
- Curve point meaning: normalized source time and normalized parameter value.
- Curve interpolation: smoothstep.
- Enabled state and unique serial chain order.
- Mapping equations, defaults, smoothing coefficients, feedback caps, damping, gain, limiter, and Delay tail rules.
- Timbre brand Gold and semantic parameter colors.

## Feature Migration Matrix

| Feature | Current web implementation | Platform-independent behavior | Replacement needed | Risk | Priority |
|---|---|---|---|---|---|
| File loading | Browser file input + `decodeAudioData` | Local decode and source replacement | Native file picker/decoder | Medium codec variance | High |
| Default sample | Generated AudioBuffer | 8 s percussive broadband-noise source | Native/generated buffer | Low if constants preserved | Medium |
| Curve editor | Canvas + Pointer Events | Normalized points, tools, endpoint protection | Native drawing/input layer | Medium interaction drift | High |
| Transport | Bottom bar, Output Time source-waveform seek + AudioWorklet messages | Play, Stop/reset, normalized source seek, natural end, stale-event protection; do not mistake source peaks for processed output or a seekable delay tail | Native audio transport | High lifecycle risk | High |
| Output meter | Web Audio analyser after Worklet | Final L/R RMS, peak, hold, latched CLIP and reset; measurement only | Native final-output tap | Low DSP risk, medium UI timing risk | Medium |
| Signal chain | DOM drag/drop | Unique enabled modules in user order | Native reorder control | Low | High |
| Realtime DSP | AudioWorklet | Stereo ordered effects with documented algorithms | Native realtime callback/DSP | High audible drift | High |
| Offline Render | Main-thread JS module | Same parameter model and DSP, tail, safety | Background render engine | High parity risk | High |
| WAV export | Blob RIFF encoder | Compatible stereo 24-bit PCM at 48 kHz | Native file writer | Low | High |
| Design system | CSS variables/Canvas paint | Semantic tokens and hierarchy | Native theme tokens | Low | Medium |

## DSP Reproduction Requirements

1. Implement the equations and state updates in `DSP_BEHAVIOR.md` before subjective redesign.
2. Use one pure DSP specification/core for realtime and offline processing where the target architecture permits.
3. Preserve stereo LFO phase offsets: Flanger right +0.25 cycle, Chorus right +0.5 cycle.
4. Preserve sample-rate-dependent cutoff cap and delay-buffer timing.
5. Preserve effect-state reset behavior when modules are removed.
6. Compare fixed, slow, and fast curves against reference exports before fine tuning.
7. Distinguish expected platform resampling differences from algorithm drift.
8. Decide through A/B testing whether to reproduce the web Preview's linear source interpolation or use a higher-quality native sample-rate converter.
9. Do not reproduce the current asymmetric LFO reset or missing non-finite defense as product requirements without explicit approval.
10. Preserve the current web build and accepted reference WAVs as the comparison baseline before changing damping, interpolation, limiter, or wet/dry behavior.

## Future State/Preset Schema

No state-file feature exists. A future versioned format should use product meanings rather than DOM or Canvas details:

```json
{
  "schemaVersion": 1,
  "product": "TimbreCurveLab",
  "effects": {
    "enabled": ["comb", "delay"],
    "chainOrder": ["comb", "delay"]
  },
  "curves": {
    "combDelay": [{ "time": 0, "value": 0.52 }, { "time": 1, "value": 0.52 }]
  },
  "settings": {
    "outputGain": 0.95
  }
}
```

This example is `PROPOSED`, not an implemented or frozen schema. Source audio embedding/reference policy is `TO BE DOCUMENTED`.

## Web-Specific Dependencies

- AudioWorklet and AudioContext lifecycle.
- Browser codec support and autoplay/security rules.
- Canvas pixels, CSS layout, browser drag/drop, Pointer Events.
- Blob URL download and browser confirmation dialog.
- Main-thread offline rendering with event-loop yields.

These dependencies are migration notes, not reasons to rewrite the current web app prematurely.

## Reference Verification Pack

Before a Standalone implementation is considered equivalent, retain or create:

- default generated sample constants,
- steady sine, impulse/percussion, noise, and ordinary music inputs,
- normalized curve fixtures for fixed/slow/fast/extreme cases,
- expected parameter values at known times,
- chain-order tests,
- stereo phase/channel tests,
- reference WAVs with sample rate, channels, duration, peak, and format metadata,
- documented listening comparison.

The repository currently has no committed automated reference-audio pack. Status: `PROPOSED`.

`REFERENCE_SOUND_SET.md` now defines the required fixture names, source properties, curve cases, measurements, and listening record. The actual fixed WAV fixtures and accepted reference renders are still `PROPOSED`; the specification must not be mistaken for completed evidence.

## Current Migration Risks

1. Preview and Render duplicate DSP/mapping code, creating future drift risk.
2. Formal listening-based fine-tuning history is incomplete.
3. Current export is 48 kHz / 24-bit stereo after validated band-limited conversion (D-018). Preserve body plus intentional Delay-tail time.
4. Browser decoding behavior is not a portable codec specification.
5. Multichannel sources are reduced to stereo.
6. The current default noise uses unseeded randomness and cannot reproduce sample-identical test runs.
7. Preview performs linear source-rate conversion while Render processes at source rate then band-limits/resamples to 48 kHz; high-frequency Preview/Render comparison remains a separate task.
8. Current web endpoint points are deletion-protected but can still be moved away from normalized time 0 and 1.

## What Not To Migrate

Do not treat HTML IDs, CSS pixels, DOM order, Canvas backing dimensions, browser event names, cache query strings, or GitHub Pages details as product behavior.

## Identity Asset

STANDALONE ASSET: `assets/identity/timbre-app.svg`, matching symbol/micro variants
and shared palette. This web pilot does not validate native Dock rendering.
