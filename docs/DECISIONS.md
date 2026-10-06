# Product Decisions

This log records decisions that constrain future work. Dates are documentation dates unless a commit provides direct historical evidence.

## D-001: Independent Timbre Product

- **Date:** 2026-09-29 documentation baseline
- **Decision:** Timbre Curve Lab remains independent from Audio Curve Lab.
- **Reason:** It shares a product-family visual language but has distinct timbre parameters, DSP, and musical aims.
- **Affects:** Architecture, repository scope, Standalone migration.

## D-002: Effects Start Bypassed

- **Date:** Existing behavior, documented 2026-09-29
- **Decision:** All effects start off. Users intentionally add modules one by one.
- **Reason:** The initial sound should be the original source, and the source of each audible change should be teachable.
- **Affects:** Initialization, Preview, Render, UI state.

## D-003: Seven Unique Serial Modules

- **Date:** Existing behavior, documented 2026-09-29
- **Decision:** Low Pass, High Pass, Band Pass, Comb, Flanger, Chorus, and Delay can each appear once. Enabled modules are processed in draggable chain order.
- **Reason:** Order is musically meaningful, while duplicate instances would complicate the compact learning workflow.
- **Affects:** State, routing, UI, Preview, Render, future presets.

## D-004: Parameter Colors Are Semantic

- **Date:** Existing behavior, documented 2026-09-29
- **Decision:** Brand Gold identifies Timbre Curve Lab; it does not replace parameter colors.
- **Reason:** Curve color is functional information needed to distinguish simultaneous parameters.
- **Affects:** Canvas, controls, legends, design system.

## D-005: Band Pass Uses Center And Width

- **Date:** Existing behavior, documented 2026-09-29
- **Decision:** Band Pass exposes Center Frequency and a symmetric Width curve. Full Width bypasses the band-pass coloration.
- **Reason:** The graphic should communicate a band around a center trajectory; the full state provides an intentional unfiltered endpoint.
- **Alternatives considered:** Direct Q editing; separate low/high band edges.
- **Affects:** Mapping, Canvas drawing, DSP, labels.

## D-006: Delay Families Remain Distinct

- **Date:** Existing behavior, documented 2026-09-29
- **Decision:** Comb, Flanger, Chorus, and Delay remain separate modules with ranges chosen for their characteristic time scales.
- **Reason:** A moving Comb can resemble Flanger or Chorus, but dedicated ranges, LFO behavior, and controls make each concept clearer in class and composition.
- **Affects:** Feature scope, parameter ranges, DSP.

## D-007: Delay Begins At 100 ms And Has No Tone Control

- **Date:** Existing behavior, documented 2026-09-29
- **Decision:** Delay Time is 100-1500 ms. User controls are Delay Time, Feedback, and Mix; Tone/Damping is not exposed.
- **Reason:** The minimum favors audible echo separation over comb coloration, and removing Tone keeps the module compact. Internal damping remains for stability and character.
- **Affects:** Parameter specification, UI, DSP.

## D-008: Comb Starts With A Strong Teaching Preset

- **Date:** 2026-09-30
- **Previous:** Delay Time 8 ms, Feedback 0.50, Mix 80%.
- **Current:** Delay Time 8 ms, Feedback 0.80, Mix 90%.
- **Reason:** Make metallic resonance and pitch-like coloration audible immediately when Comb is enabled.
- **Affects:** Default curve, classroom first impression, Preview, Render.

## D-009: Default Source Is Percussive White Noise

- **Date:** 2026-09-02 and refined 2026-09-26
- **Decision:** Load an 8-second gated/percussive white-noise sample automatically; no separate sample button.
- **Reason:** Broadband noise reveals filter and modulation behavior across the spectrum without requiring a file first.
- **Affects:** Initialization, teaching flow, AudioContext sample rate.

## D-010: Browser-Local Processing

- **Date:** Existing product principle
- **Decision:** Source audio is decoded, processed, and exported in the browser without upload.
- **Reason:** Classroom access, privacy, copyright sensitivity, and static hosting.
- **Affects:** Architecture, deployment, compatibility, performance.

## D-011: Curve Lab Design System With Gold Identity

- **Date:** 2026-09-28 (`78cefe1`)
- **Decision:** Use the shared deep-navy/charcoal design language and Gold `#F2B705` brand identity while preserving semantic parameter colors.
- **Affects:** Header, controls, Canvas, responsive UI, Standalone visual tokens.

## D-012: 24-bit PCM Baseline (sample rate superseded by D-018)

- **Date:** 2026-09-29
- **Previous:** Signed 16-bit stereo PCM at the decoded source sample rate.
- **Decision:** Export signed 24-bit stereo PCM while preserving the decoded source sample rate.
- **Reason:** Increase saved amplitude precision without changing filter tone, Preview behavior, or introducing unnecessary resampling.
- **Alternative considered:** Force every export to 48 kHz. Rejected for this stage because correct sample-rate conversion would add a separate processing step; changing only the header would alter speed and pitch.
- **Affects:** WAV compatibility, quality claims, migration tests.

## D-013: Playback And Final Output Monitoring Live At The Bottom

- **Date:** 2026-09-30
- **Decision:** Keep Play, Stop, one clock, and final stereo output metering in one responsive bottom bar. Source-position seeking moved to the Output Time waveform in D-017.
- **Reason:** The Canvas remains the main workspace while transport position and audible output can be read together. Measuring after the AudioWorklet reflects the actual Preview result without changing DSP.
- **Affects:** Header layout, transport interaction, realtime routing observation, responsive design, Standalone migration.

## D-014: Delay Families Use Immediately Recognizable Defaults

- **Date:** 2026-09-30
- **Decision:** Flanger starts at 2 ms / 6 ms Depth / 0.30 Hz / 0.65 Feedback; Chorus starts at 22 ms / 10 ms Depth / 0.65 Hz / 55% Mix; Delay starts at 420 ms / 0.48 Feedback / 42% Mix.
- **Reason:** Each module should reveal its characteristic sweep, doubling, or echo as soon as it is enabled, while preserving room for stronger curve experiments.
- **Affects:** Default curves, Reset All, classroom first impression, Preview, Render, Standalone migration.

## D-015: Preserve The Current Sonic Baseline Before Brightness Changes

- **Date:** 2026-09-30
- **Decision:** Treat the current clean, moist, and musically convincing sound as the A/B baseline. The perceived shortage of high-frequency saturation, surface grain, or liveliness is a listening question, not a confirmed defect.
- **Reason:** The current restraint is musically credible. A broad treble boost or several simultaneous DSP changes would make it impossible to identify whether feedback damping, interpolation, wet/dry balance, resampling, or safety processing caused the difference.
- **First experiment:** Reduce feedback-path damping slightly in one effect at a time, leaving every other variable unchanged.
- **Acceptance evidence:** Noise, percussion, harmonic instrument, and ordinary music comparisons recorded in `FINE_TUNING_LOG.md`.
- **Affects:** Comb, Flanger, Delay, reference listening, Standalone sonic target.

## D-016: Separate Product Behavior From Web Artifacts During Migration

- **Date:** 2026-09-30 documentation audit
- **Decision:** Preserve parameter identity, mappings, curve meaning, chain behavior, and approved sound. Do not automatically preserve linear source-rate conversion, non-deterministic reference noise, asymmetric LFO reset, or main-thread rendering merely because they exist in the web code.
- **Reason:** These details may affect the current result, but they have not all been approved as musical requirements. They need explicit A/B decisions before native implementation.
- **Affects:** Reference fixtures, Preview/Render parity, native audio I/O, DSP Core boundaries.

## D-017: Separate The Source Waveform From Curve Editing

- **Date:** 2026-10-05
- **Decision:** Keep the curve Canvas for parameter editing, and place the mono/L/R source waveform and click/drag seeking in a compact Output Time strip. Remove the redundant bottom Position slider and Canvas double-click seek.
- **Reason:** Students can locate a sound event without risking a curve edit, while the two time axes remain aligned. The strip shows source peaks because the existing Preview path does not provide a processed waveform and adding a renderer would expand this UI task into DSP work.
- **Limit:** The seekable clock ends at source duration; a Delay tail may sound beyond it and make the exported WAV longer. The strip labels this explicitly rather than presenting source peaks as rendered output.
- **Affects:** Transport gestures, Canvas paint, responsive layout, future Standalone waveform semantics. Audio processing and WAV output are unchanged.

## Unknown Or Pending Rationale

- Formal listening environments and approval dates for most DSP fine-tuning values are unknown.
- The preferred behavior when several points overlap within the hit radius is not formally decided.
- A future preset schema and backward-compatibility policy remain proposed, not implemented.

## D-017: Hub-Aligned Timbre Identity Pilot

2026-10-04 · PROJECT-SPECIFIC. Adopt canonical #F4CB38 and user-selected v0.9
three-layer tapered icon, pinned through Hub v0.10 assets. Keep Delay and other
effect colors independent. Local pilot, deployment requires separate instruction.
See `IDENTITY_PILOT.md`.

## D-018: Fixed 48 kHz WAV, Preserve Existing Timbre DSP

- **Date:** 2026-10-06
- **Decision:** Resample completed stereo PCM to 48 kHz with the verified family
  windowed-sinc converter before 24-bit encoding. Existing 48k results are unchanged.
- **Previous:** D-012 preserved decoded source rate in the WAV.
- **Reason:** Adopt the product-family export specification without changing existing
  source-rate smoothing, filter behavior, LFO or tail calculation as a side effect.
- **Rejected:** Header-only conversion; input-rate DSP rewrite in this export task.
- **Trade-off:** Extra CPU/buffers for non-48k output. Cancellation is checked in blocks.
- **Verification:** 11 browser cases and 18 old/new renderer comparisons pass;
  actual file export/reopen with Delay retains 6-second body + 4.2-second tail.
- **Scope:** Local change; publishing requires the user's separate instruction.
  180-second cap, LFO reset behavior and subjective listening remain separate tasks.

## 2026-10-06 — Reject over-limit export instead of truncating (local, unpublished)

Previously the renderer silently limited the body to 180 seconds and reported capped after downloading. It now raises EXPORT_DURATION_LIMIT before output allocation; the app states that no file was saved and restores the controls. Audio checks estimated output duration after Speed; Timbre checks source duration and preserves the existing Delay tail for accepted files. Exactly 180 seconds remains supported. This is an interim explicit limit, not full long-file support. Preview and DSP inside the supported range are unchanged. Long-file memory/cancellation and full-duration policy remain open.

Validation: actual 180-second render accepted, 181/540 seconds rejected, and Audio 120-second input at Speed 0.5 rejected for its 240-second output. Browser 181-second file produced the explicit message with no console errors.

The interim export-limit patch is grouped with cancellation/recovery and time-limit clarity for one release review. No automatic expansion beyond 180 seconds; full-length rendering awaits memory/cancellation/Preview validation.


## Cancellable WAV encoding — 2026-10-06

COMMON CANDIDATE: use bounded PCM blocks and event-loop yields at the WAV serialization boundary, preserving exact file bytes. This removes the single full-WAV ArrayBuffer allocation and allows cancellation. Blob storage/copy behavior is runtime-dependent; Node RSS improvement is not a browser memory guarantee. No support-limit increase is included.

Validation: tests/wav-encoder.mjs and tests/browser-wav-encoder.html cover legacy byte parity across block boundaries, pre-abort, final-block abort, and cancel/recovery. Existing WAV, limit and recovery regressions pass; Audio transform parity also passes. Local app default 8-second export saved a 48k/24-bit WAV. Listening, Safari and low-memory device verification remain open.
