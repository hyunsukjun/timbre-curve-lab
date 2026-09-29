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

## D-012: Current Export Baseline Is 24-bit PCM

- **Date:** 2026-09-29
- **Previous:** Signed 16-bit stereo PCM at the decoded source sample rate.
- **Decision:** Export signed 24-bit stereo PCM while preserving the decoded source sample rate.
- **Reason:** Increase saved amplitude precision without changing filter tone, Preview behavior, or introducing unnecessary resampling.
- **Alternative considered:** Force every export to 48 kHz. Rejected for this stage because correct sample-rate conversion would add a separate processing step; changing only the header would alter speed and pitch.
- **Affects:** WAV compatibility, quality claims, migration tests.

## D-013: Playback And Final Output Monitoring Live At The Bottom

- **Date:** 2026-09-30
- **Decision:** Keep Play, Stop, one clock, source-position seeking, and final stereo output metering in one responsive bottom bar.
- **Reason:** The Canvas remains the main workspace while transport position and audible output can be read together. Measuring after the AudioWorklet reflects the actual Preview result without changing DSP.
- **Affects:** Header layout, transport interaction, realtime routing observation, responsive design, Standalone migration.

## D-014: Delay Families Use Immediately Recognizable Defaults

- **Date:** 2026-09-30
- **Decision:** Flanger starts at 2 ms / 6 ms Depth / 0.30 Hz / 0.65 Feedback; Chorus starts at 22 ms / 10 ms Depth / 0.65 Hz / 55% Mix; Delay starts at 420 ms / 0.48 Feedback / 42% Mix.
- **Reason:** Each module should reveal its characteristic sweep, doubling, or echo as soon as it is enabled, while preserving room for stronger curve experiments.
- **Affects:** Default curves, Reset All, classroom first impression, Preview, Render, Standalone migration.

## Unknown Or Pending Rationale

- Formal listening environments and approval dates for most DSP fine-tuning values are unknown.
- The preferred behavior when several points overlap within the hit radius is not formally decided.
- A future preset schema and backward-compatibility policy remain proposed, not implemented.
