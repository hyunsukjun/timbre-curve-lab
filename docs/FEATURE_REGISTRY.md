# Feature Registry

Status meanings: `IDEA`, `PROPOSED`, `APPROVED`, `IMPLEMENTED`, `VERIFIED`, `DEPRECATED`.

## COMMON-001: Local Audio Source

- **Category:** Common / Input
- **Status:** VERIFIED
- **Purpose:** Provide source material without uploading it.
- **User behavior:** The app starts with an 8-second percussive white-noise sample. `Open Audio` replaces it with a browser-decodable local file.
- **Input:** Generated stereo sample or local audio file.
- **Output:** Decoded `AudioBuffer`, mono or separate L/R source-waveform summaries, duration, and transport readiness.
- **Edge cases:** Unsupported files show a short error; files longer than 180 seconds can load, but export is capped.
- **Web implementation:** `src/app.js`, Web Audio decoding, file input.
- **Platform-independent requirement:** Source replacement must reset playback safely while preserving local-only processing.
- **Tests:** Initialization, file replacement, mono/stereo input, unsupported input, 5-30 second real file.

## COMMON-002: Curve Editor

- **Category:** Common / Editing
- **Status:** VERIFIED
- **Purpose:** Compose a parameter trajectory over source time.
- **Data model:** Sorted point arrays with normalized `x` time and normalized `y` value.
- **Interaction:** Pen adds or moves points; Eraser deletes one interior point; endpoints are protected.
- **Processing:** Smoothstep interpolation between adjacent points.
- **Edge cases:** Empty Eraser clicks do nothing; overlapping points use first hit within the current 18 px radius; resize does not alter stored values.
- **Web implementation:** Canvas and Pointer Events in `src/app.js`.
- **Standalone requirement:** Preserve normalized data, smoothstep interpolation, endpoint semantics, and gesture meaning.

## COMMON-003: Transport And Playhead

- **Category:** Common / Preview
- **Status:** VERIFIED
- **Purpose:** Audition curve-driven processing in time.
- **User behavior:** Bottom-bar Play and Stop, Spacebar toggle, click/drag/keyboard seek in the Output Time waveform, moving playhead, natural return to start.
- **Display contract:** The curve Canvas shows curves and the playhead but no waveform. The Output Time strip shows the original source waveform, not the processed signal; its seekable span is source duration. Delay tails can continue beyond that span and appear only in Preview/Render audio.
- **Output:** Stereo browser audio.
- **Dependencies:** Web Audio API and AudioWorklet over localhost/HTTPS.
- **Standalone requirement:** Stale playback messages must not override the newest transport action.

## COMMON-003A: Final Output Meter

- **Category:** Common / Preview
- **Status:** VERIFIED
- **Purpose:** Show the level actually leaving the realtime Timbre engine without changing it.
- **User behavior:** L/R RMS and peak movement, one-second peak hold, latched CLIP indication, and click-to-clear CLIP.
- **Signal source:** The stereo signal after the Timbre AudioWorklet and before the browser destination.
- **Standalone requirement:** Metering remains measurement-only and follows the platform's actual final output channels.

## COMMON-004: Effect Signal Chain

- **Category:** Common / Routing
- **Status:** VERIFIED
- **Purpose:** Make serial processing order visible and editable.
- **User behavior:** Enabling an effect appends it; disabling removes it; re-enabling appends it again; drag blocks between Input and Output to reorder.
- **Data model:** Ordered list of unique enabled effect IDs.
- **Output:** The same order is sent to Preview and Render.
- **Edge cases:** One instance maximum per effect; disabled effects are filtered from processing.
- **Standalone requirement:** Visual order and audible order must always agree.

## COMMON-005: Offline WAV Export

- **Category:** Common / Output
- **Status:** VERIFIED
- **Purpose:** Produce a reusable audio result.
- **Input:** Current source, curves, enabled states, and chain order.
- **Output:** RIFF/WAVE, PCM format 1, stereo, signed 24-bit little-endian, fixed 48 kHz.
- **Processing:** Offline sample loop with delay tail, safety limiting, downward-only peak normalization, then actual band-limited 48 kHz conversion.
- **Edge cases:** Source processing capped at 180 seconds; Delay tail capped at 10 seconds; mono is duplicated; channels above two are not retained.
- **Standalone requirement:** Signed 24-bit PCM at 48 kHz, preserving processed duration including the intentional Delay tail. Source-rate DSP is retained before conversion.

## COMMON-006: Clear And Reset

- **Category:** Common / State
- **Status:** VERIFIED
- **Purpose:** Recover a parameter or whole workspace safely.
- **User behavior:** `Clear Current` restores only the active curve default. `Reset All` asks for confirmation, restores all defaults, bypasses all effects, and empties the chain.
- **Standalone requirement:** Destructive whole-project reset requires confirmation.

## TIMBRE-001: Low Pass

- **Category:** Timbre / Filter
- **Status:** IMPLEMENTED
- **Purpose:** Darken or reveal brightness over time by attenuating content above a moving cutoff.
- **Parameter:** `lowpass`, 40 Hz to min(18 kHz, 0.45 x sample rate), logarithmic.
- **Processing:** State-variable low-pass response, fixed Q 0.71.
- **Musical note:** The logarithmic scale gives more visual space to perceptually meaningful lower frequencies.
- **Tests:** Fixed, slow, fast, minimum, and maximum cutoff; Preview/Render comparison still needs formal listening documentation.

## TIMBRE-002: High Pass

- **Category:** Timbre / Filter
- **Status:** IMPLEMENTED
- **Purpose:** Thin or lighten sound by attenuating content below a moving cutoff.
- **Parameter:** `highpass`, same cutoff mapping as Low Pass.
- **Processing:** State-variable high-pass response, fixed Q 0.71.

## TIMBRE-003: Band Pass

- **Category:** Timbre / Filter
- **Status:** IMPLEMENTED
- **Purpose:** Isolate and move a frequency region.
- **Parameters:** `bandpassCenter`, `bandpassWidth`.
- **Processing:** State-variable band-pass response. Width maps inversely to Q from 12 to 0.5. Width at or above 0.995 bypasses the filter as a full-band state.
- **Interaction:** Width is drawn symmetrically around the Center curve.
- **Musical note:** Narrow values emphasize a resonant band; Full intentionally passes the source without coloration.

## TIMBRE-004: Comb

- **Category:** Timbre / Delay Filter
- **Status:** IMPLEMENTED
- **Purpose:** Create metallic resonance and pitched short-delay coloration.
- **Parameters:** `combDelay`, `combFeedback`, `combMix`.
- **Processing:** Fractional delay with linear interpolation, feedback damping, delay smoothing, dry/combed mix, and feedback clamp.
- **Default character:** 8 ms, feedback 0.80, mix 90%.
- **Known limitation:** Fast Delay Time curves can enter flanger-like territory by design.

## TIMBRE-005: Flanger

- **Category:** Timbre / Modulation
- **Status:** IMPLEMENTED
- **Purpose:** Produce a moving comb sweep with a short modulated delay.
- **Parameters:** `flangerDelay`, `flangerDepth`, `flangerRate`, `flangerFeedback`.
- **Processing:** Sine LFO, fractional delay, feedback damping, stereo phase offset, fixed dry/delayed balance.

## TIMBRE-006: Chorus

- **Category:** Timbre / Modulation
- **Status:** IMPLEMENTED
- **Purpose:** Produce thicker, wider doubling.
- **Parameters:** `chorusDelay`, `chorusDepth`, `chorusRate`, `chorusMix`.
- **Processing:** Longer modulated fractional delay with a half-cycle stereo phase offset and variable mix.

## TIMBRE-007: Delay

- **Category:** Timbre / Echo
- **Status:** IMPLEMENTED
- **Purpose:** Produce perceptually separate echoes rather than comb coloration.
- **Parameters:** `delayTime`, `delayFeedback`, `delayMix`.
- **Processing:** 100-1500 ms fractional delay, feedback damping, delay smoothing, variable mix, and rendered tail.
- **Decision:** Tone/Damping is not a user parameter in the current version; damping remains internal.

## Not Present

Undo/Redo, preset saving, project files, touch-specific gestures, multichannel export, fixed-48-kHz resampling, and plugin hosting are not current features. Do not infer them from the common Curve Lab roadmap.

## TCL-IDENTITY-001: Hub Identity Pilot

Status: IMPLEMENTED (Timbre identity pilot). Header and favicon use canonical Timbre v0.9
symbols retained in Hub v0.10. Product color #F4CB38. See `IDENTITY_PILOT.md`.

## 2026-10-06 — Reject over-limit export instead of truncating (local, unpublished)

Previously the renderer silently limited the body to 180 seconds and reported capped after downloading. It now raises EXPORT_DURATION_LIMIT before output allocation; the app states that no file was saved and restores the controls. Audio checks estimated output duration after Speed; Timbre checks source duration and preserves the existing Delay tail for accepted files. Exactly 180 seconds remains supported. This is an interim explicit limit, not full long-file support. Preview and DSP inside the supported range are unchanged. Long-file memory/cancellation and full-duration policy remain open.

Validation: actual 180-second render accepted, 181/540 seconds rejected, and Audio 120-second input at Speed 0.5 rejected for its 240-second output. Browser 181-second file produced the explicit message with no console errors.

Release scope remains explicit export limits, early abort and recovery, not expanded long-file support. Audio limit notices use Speed-derived output time.


## Cancellable WAV encoding — 2026-10-06

WAV export now encodes 65,536-frame PCM blocks with a task yield between blocks, including the final block. The existing Cancel action remains effective during encoding. Stereo 48 kHz / 24-bit WAV and the 180-second admission policy are unchanged.

Validation: tests/wav-encoder.mjs and tests/browser-wav-encoder.html cover legacy byte parity across block boundaries, pre-abort, final-block abort, and cancel/recovery. Existing WAV, limit and recovery regressions pass; Audio transform parity also passes. Local app default 8-second export saved a 48k/24-bit WAV. Listening, Safari and low-memory device verification remain open.


## Block-fed WAV conversion — 2026-10-06

COMMON CANDIDATE: browser Download WAV requests includePCM:false. After unchanged source-rate DSP, the existing 96-tap conversion sends synchronous Float32 blocks to the PCM24 writer. Global frame indices, filter phase and Float32 rounding remain unchanged. The sink snapshots each block before it is reused. No full converted stereo PCM arrays are allocated for this path. At 48 kHz the sink consumes views of the existing source-rate output. Returned data contains Blob, frameCount, sampleRate, duration and truncated, not left/right. The default includePCM:true preserves the diagnostic PCM-returning API.

Cancellation is checked through conversion, append and finalization, including after the final block yield. The writer rejects incomplete output. Source-rate output and Blob payload still occupy memory; this is not streaming the DSP itself. The 180-second policy and Preview stay unchanged. Native migration should preserve this file contract without requiring the web Blob implementation.

Validation: frozen pre-change conversion/PCM24 oracle, 32 cases per Lab across 32/44.1/48/88.2/96 kHz, block edges, cancellation/recovery and renderer parity (Timbre Delay tail included). Existing regression suites pass. Nine-minute stereo 96k QA-only profiles preserve WAV duration and marker regions; Node memory measurements do not certify browser/low-memory behavior or listening quality.
