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

## 2026-10-06 — Reject over-limit export instead of truncating (local, unpublished)

Previously the renderer silently limited the body to 180 seconds and reported capped after downloading. It now raises EXPORT_DURATION_LIMIT before output allocation; the app states that no file was saved and restores the controls. Audio checks estimated output duration after Speed; Timbre checks source duration and preserves the existing Delay tail for accepted files. Exactly 180 seconds remains supported. This is an interim explicit limit, not full long-file support. Preview and DSP inside the supported range are unchanged. Long-file memory/cancellation and full-duration policy remain open.

Validation: actual 180-second render accepted, 181/540 seconds rejected, and Audio 120-second input at Speed 0.5 rejected for its 240-second output. Browser 181-second file produced the explicit message with no console errors.

### Export recovery follow-up — 2026-10-06

Already-aborted or over-limit renders exit before accessing source PCM channels or allocating output arrays. Five cancel/re-render cycles reproduce the same clean WAV. Browser checks with a 180-second file confirm Cancel returns controls; loading a new 6-second file then exports stereo 48k/24-bit/6 seconds. No console warnings/errors observed. Audio labels its existing capped playback timeline “preview limit”; this does not extend playback or export support. Long-file heap/GC behavior and low-memory device testing are still unverified.


## Cancellable WAV encoding — 2026-10-06

STANDALONE ASSET: WAV serialization must preserve signed 24-bit quantization, stereo ordering and exact frame count, and allow cancellation before publishing a complete file. The web implementation uses chunked Blob parts; native software may use a cancellable file writer instead. Never expose a partial export as successful.

Validation: tests/wav-encoder.mjs and tests/browser-wav-encoder.html cover legacy byte parity across block boundaries, pre-abort, final-block abort, and cancel/recovery. Existing WAV, limit and recovery regressions pass; Audio transform parity also passes. Local app default 8-second export saved a 48k/24-bit WAV. Listening, Safari and low-memory device verification remain open.


## Block-fed WAV conversion — 2026-10-06

COMMON CANDIDATE: browser Download WAV requests includePCM:false. After unchanged source-rate DSP, the existing 96-tap conversion sends synchronous Float32 blocks to the PCM24 writer. Global frame indices, filter phase and Float32 rounding remain unchanged. The sink snapshots each block before it is reused. No full converted stereo PCM arrays are allocated for this path. At 48 kHz the sink consumes views of the existing source-rate output. Returned data contains Blob, frameCount, sampleRate, duration and truncated, not left/right. The default includePCM:true preserves the diagnostic PCM-returning API.

Cancellation is checked through conversion, append and finalization, including after the final block yield. The writer rejects incomplete output. Source-rate output and Blob payload still occupy memory; this is not streaming the DSP itself. The 180-second policy and Preview stay unchanged. Native migration should preserve this file contract without requiring the web Blob implementation.

Validation: frozen pre-change conversion/PCM24 oracle, 32 cases per Lab across 32/44.1/48/88.2/96 kHz, block edges, cancellation/recovery and renderer parity (Timbre Delay tail included). Existing regression suites pass. Nine-minute stereo 96k QA-only profiles preserve WAV duration and marker regions; Node memory measurements do not certify browser/low-memory behavior or listening quality.


## Deterministic transport LFO reset — 2026-10-06

Full reset explicitly restores left Flanger/Chorus phase to 0; right offsets remain 0.25/0.5. This affects Stop(reset), seek, buffer replacement and natural-end restart paths that call resetFilter. Pausing without reset and bypass/re-enable policy are not changed. It fixes history-dependent Preview restarts without changing fresh Render, modulation ranges or tone tuning. Seek starts cleared state at the destination; it does not reconstruct the effect history from the start of the file.

Validation: tests/transport-parity.mjs executes the actual Worklet class in a Node mock at 48k, 128-frame blocks. Ten effect orders compare left-channel first-half PCM for repeated Stop/Play, used-vs-fresh seek, and initial Preview versus Render. All tested differences are zero after the fix. Real browser Flanger+Chorus play, seek, Stop and replay passed with no console warnings/errors. Right-channel full numerical parity, natural-end replay, full tails, high feedback and cross-rate Preview comparisons remain separate verification targets.


### Final transport and endpoint verification — 2026-10-06

Preview now uses the full source frame count for end/replay/seek bounds. Linear reading holds the final sample for fractional positions in the last frame and returns zero beyond the buffer. Previously Preview stopped three frames early; this truncated the last effect samples and ended tails early. Render processing is unchanged.

transport-tail.mjs adds 13 stereo cases including individual modulation effects, Delay at normalized feedback 0 and 1 (actual 0/0.85), Chorus/Delay in both orders, and full/reversed chains. At 48k with a low-level 0.25-second fixture ending in nonzero PCM: full Preview/Render output including tail matches exactly, Stop/Play and seek history checks pass for both channels, one ended event is emitted, post-end output is silent, and natural replay reproduces initial PCM. This supersedes the earlier pending status for these specific cases. Extreme gain, other rates, all curve shapes and listening remain outside this claim.
