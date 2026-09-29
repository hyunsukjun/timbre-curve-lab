# Feature Registry

Status meanings: `IDEA`, `PROPOSED`, `APPROVED`, `IMPLEMENTED`, `VERIFIED`, `DEPRECATED`.

## COMMON-001: Local Audio Source

- **Category:** Common / Input
- **Status:** VERIFIED
- **Purpose:** Provide source material without uploading it.
- **User behavior:** The app starts with an 8-second percussive white-noise sample. `Open Audio` replaces it with a browser-decodable local file.
- **Input:** Generated stereo sample or local audio file.
- **Output:** Decoded `AudioBuffer`, waveform summary, duration, and transport readiness.
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
- **User behavior:** Bottom-bar Play and Stop, Spacebar toggle, Position slider and Canvas double-click seek, moving playhead, natural return to start.
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
- **Output:** RIFF/WAVE, PCM format 1, stereo, signed 24-bit little-endian, source sample rate.
- **Processing:** Offline sample loop with delay tail, safety limiting, and downward-only peak normalization when needed.
- **Edge cases:** Source processing capped at 180 seconds; Delay tail capped at 10 seconds; mono is duplicated; channels above two are not retained.
- **Standalone requirement:** Signed 24-bit PCM with source-rate preservation is the current compatibility baseline.

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
- **Default character:** 8 ms, feedback 0.50, mix 80%.
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
