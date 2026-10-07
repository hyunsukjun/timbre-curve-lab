# Interaction Specification

This document describes user intent rather than browser event names. Current web details are included only to make behavior testable.

## Initial State

- An 8-second percussive white-noise sample is ready automatically.
- All seven effects are bypassed.
- The signal chain contains only Input and Output.
- Pen is selected.
- Every parameter contains protected start and end points at its default value.
- No curve is actively selected until an effect is selected.

## Effect Selection And Bypass

1. Selecting a bypassed effect enables it, appends it to the chain, and opens its default parameter.
2. Selecting another effect changes the edited effect without disabling the previous one.
3. Selecting the currently edited effect again bypasses it, removes it from the chain, and clears the visible active curve.
4. Curve data remains stored while an effect is bypassed.
5. Re-enabling an effect restores its curve data and appends the module to the end of the chain.

Each effect can occur only once. Enabled state and currently edited state are distinct: enabled determines audio processing; edited determines visible controls and Canvas emphasis.

## Parameter Selection

- Low Pass and High Pass each open their one cutoff curve.
- Band Pass opens Center Frequency by default; Center Frequency and Width remain selectable.
- Comb opens Delay Time by default; Delay Time, Feedback, and Mix remain selectable.
- Flanger opens Delay Time by default; Delay Time, Depth, Rate, and Feedback remain selectable.
- Chorus opens Delay Time by default; Delay Time, Depth, Rate, and Mix remain selectable.
- Delay opens Delay Time by default; Delay Time, Feedback, and Mix remain selectable.
- Only parameter controls for the currently edited multi-parameter effect are shown.

## Pen

- Pen is the default tool.
- Clicking empty Canvas space creates one point at that normalized time and value.
- Clicking an existing point selects it without adding another point.
- Dragging a selected or newly created point updates time and value continuously.
- The point list is sorted by normalized time after movement.
- Current web behavior allows endpoint values and endpoint time positions to be dragged. Endpoint protection currently means deletion protection only; fixed `x=0` and `x=1` endpoints are a future product decision, not implemented behavior.
- Current values are visible during hover or drag; transient drag feedback clears after release.
- Band Width vertical distance is interpreted relative to the Center Frequency curve at the same time, creating a symmetric visual band.

## Eraser

- Selecting Eraser changes both tool-button state and Canvas cursor.
- Clicking an interior point deletes only that point.
- Clicking empty space does not create a point.
- The first and last points cannot be deleted.
- Mac Command-click and Windows/PC Ctrl-click temporarily use Eraser behavior while Pen remains selected.
- Releasing the modifier returns cursor behavior to the selected tool.

## Point Hit And Overlap

The current web hit radius is 18 CSS pixels. If multiple points overlap inside that radius, the first matching point in time-sorted order is selected. This outcome is implemented but not yet evaluated as the preferred long-term overlap policy.

Points may currently share the same or nearly the same normalized time. Smoothstep evaluation uses a minimum segment denominator of `1e-6`; the preferred standalone policy for coincident-time points is `TO BE DOCUMENTED`.

Status: `TO BE DOCUMENTED` for a future explicit overlap-selection rule.

## Clear Current

- Available only when a curve is active.
- Stops playback.
- Restores the active parameter curve to its two default endpoints.
- Leaves all other curves, effect enable states, and chain order unchanged.

## Reset All

- Requires a browser confirmation before execution.
- On confirmation: stops playback, restores all parameter curves, bypasses all effects, clears the chain, clears active selection, and invalidates any previous export.
- On cancellation: changes nothing.

## Signal Chain Reordering

- Enabled modules appear between Input and Output.
- Dragging a module before another module inserts it at that position.
- Dropping on Output moves it to the end.
- Reordering changes both Preview and Render processing order.
- Clicking a chain block selects that effect's default parameter without changing enabled state.

## Transport

- Play starts or resumes from the current playhead.
- Stop stops and resets to the beginning.
- Spacebar toggles Play/Stop when focus is not in editable text.
- The curve Canvas is reserved for point editing. Seeking uses the separate Output Time waveform.
- Natural completion returns the playhead to zero and allows immediate replay.
- Starting a new playback operation invalidates stale transport messages through a playback token.

## File Replacement

- `Open Audio` selects a local file and replaces the current source after decoding.
- The file is not uploaded.
- Playback stops and the playhead resets during replacement.
- Existing effect/curve state is currently retained when the source changes.
- Unsupported decoding displays: `Could not load audio. Try WAV, MP3, or M4A.`

## WAV Export

- `Download WAV` renders the current state, displays progress, and downloads `TimbreCurveLab-export.wav`.
- If Preview is playing, it is stopped before rendering.
- During rendering the same button becomes `Cancel`; a second activation aborts the render.
- Editing a curve, enabled state, or chain order marks the prior export as stale.

## Responsive And High-DPI Behavior

Stored curve values do not change on resize. The web Canvas recalculates backing pixels from device pixel ratio and derives pointer values from the current visible rectangle. The workspace retains a minimum horizontal width and can be horizontally clipped/scrolled by its frame strategy.

## Keyboard And Accessibility Baseline

- `Space`: transport toggle.
- `Command+click` on macOS: temporary Eraser.
- `Ctrl+click` on PC: temporary Eraser.
- Buttons expose pressed states where applicable and have visible keyboard focus.
- Touch-specific behavior is `UNVERIFIED` and not a current target.
# Bottom Playback Bar

- The only Play, Stop, and elapsed/total time controls are in the bottom playback bar.
- Clicking or dragging the Output Time waveform seeks through source seconds. During playback, audio continues from the selected position; when stopped, Play begins there. Arrow keys move one second (Shift: 0.1 second); Home/End jump to the bounds.
- A solid vertical line with two triangle handles shows the current position in the waveform; an equally bright dashed line previews the pointer position. The dashed guide is hidden during dragging and outside the waveform.
- The curve Canvas playhead, Output Time line, and bottom clock share the same source-time position. The displayed waveform is original source audio, with one mono lane or separate L/R lanes; it is not a processed-waveform preview.
- The Output Time strip ends at source duration. Delay tails can sound after the source ends and extend the WAV, but the current AudioWorklet cannot seek into the tail. No extra realtime renderer is created for this visual guide.
- Stop and natural completion return the clock and both playheads to zero.
- L/R meters show the final Preview output. CLIP remains lit until its button is pressed.

## 2026-10-06 — Reject over-limit export instead of truncating (local, unpublished)

Previously the renderer silently limited the body to 180 seconds and reported capped after downloading. It now raises EXPORT_DURATION_LIMIT before output allocation; the app states that no file was saved and restores the controls. Audio checks estimated output duration after Speed; Timbre checks source duration and preserves the existing Delay tail for accepted files. Exactly 180 seconds remains supported. This is an interim explicit limit, not full long-file support. Preview and DSP inside the supported range are unchanged. Long-file memory/cancellation and full-duration policy remain open.

Validation: actual 180-second render accepted, 181/540 seconds rejected, and Audio 120-second input at Speed 0.5 rejected for its 240-second output. Browser 181-second file produced the explicit message with no console errors.

### Export recovery follow-up — 2026-10-06

Already-aborted or over-limit renders exit before accessing source PCM channels or allocating output arrays. Five cancel/re-render cycles reproduce the same clean WAV. Browser checks with a 180-second file confirm Cancel returns controls; loading a new 6-second file then exports stereo 48k/24-bit/6 seconds. No console warnings/errors observed. Audio labels its existing capped playback timeline “preview limit”; this does not extend playback or export support. Long-file heap/GC behavior and low-memory device testing are still unverified.


## Cancellable WAV encoding — 2026-10-06

Cancel during PCM-to-WAV encoding raises AbortError at a block boundary; no partial Blob is returned or downloaded. A pending cancellation after the final PCM block is checked before success. Controls recover through the existing render lifecycle. Progress remains the existing DSP progress indicator; no new encoding percentage is claimed.

Validation: tests/wav-encoder.mjs and tests/browser-wav-encoder.html cover legacy byte parity across block boundaries, pre-abort, final-block abort, and cancel/recovery. Existing WAV, limit and recovery regressions pass; Audio transform parity also passes. Local app default 8-second export saved a 48k/24-bit WAV. Listening, Safari and low-memory device verification remain open.


### Block-fed export lifecycle

Download WAV uses the Blob-only renderer path. Existing Cancel and control recovery remain; no partial file is published. Progress retains its existing DSP-only meaning. PCM arrays are returned only to callers using the default diagnostic path.


## Deterministic transport LFO reset — 2026-10-06

Full reset explicitly restores left Flanger/Chorus phase to 0; right offsets remain 0.25/0.5. This affects Stop(reset), seek, buffer replacement and natural-end restart paths that call resetFilter. Pausing without reset and bypass/re-enable policy are not changed. It fixes history-dependent Preview restarts without changing fresh Render, modulation ranges or tone tuning. Seek starts cleared state at the destination; it does not reconstruct the effect history from the start of the file.

Validation: tests/transport-parity.mjs executes the actual Worklet class in a Node mock at 48k, 128-frame blocks. Ten effect orders compare left-channel first-half PCM for repeated Stop/Play, used-vs-fresh seek, and initial Preview versus Render. All tested differences are zero after the fix. Real browser Flanger+Chorus play, seek, Stop and replay passed with no console warnings/errors. Right-channel full numerical parity, natural-end replay, full tails, high feedback and cross-rate Preview comparisons remain separate verification targets.


### Final transport and endpoint verification — 2026-10-06

Preview now uses the full source frame count for end/replay/seek bounds. Linear reading holds the final sample for fractional positions in the last frame and returns zero beyond the buffer. Previously Preview stopped three frames early; this truncated the last effect samples and ended tails early. Render processing is unchanged.

transport-tail.mjs adds 13 stereo cases including individual modulation effects, Delay at normalized feedback 0 and 1 (actual 0/0.85), Chorus/Delay in both orders, and full/reversed chains. At 48k with a low-level 0.25-second fixture ending in nonzero PCM: full Preview/Render output including tail matches exactly, Stop/Play and seek history checks pass for both channels, one ended event is emitted, post-end output is silent, and natural replay reproduces initial PCM. This supersedes the earlier pending status for these specific cases. Extreme gain, other rates, all curve shapes and listening remain outside this claim.


## Active-playback bypass LFO reset — 2026-10-06 (local, unpublished)

resetInactiveStates now restores left Flanger/Chorus phase to zero alongside existing right offsets 0.25/0.5 when inactive effects are processed during playback. Previously left phases survived while the right reset. Two explicit assignments fix that asymmetry; no effect ranges, offline DSP, transport reset or tail policies change.

rate-toggle.mjs verifies 24 source/context-rate transport cases (44.1/48/88.2/96k input, 44.1/48k context, bypass/Flanger/Chorus): finite stereo output, restart/seek/natural-replay consistency and endpoint within one context frame. Four same-rate bypass/re-enable cases reproduce clean-reference stereo PCM exactly. This does not assert cross-rate Preview/Render tonal equivalence. Inactive processing must occur between OFF and ON; pause-time or same-quantum rapid toggles are not covered by this fix. Browser playback OFF/ON control and chain state also checked.


## Immediate inactive-state cleanup — 2026-10-06 (local, unpublished)

Settings messages now call resetInactiveStates(orderedEffects()) immediately after the existing Comb deactivation cleanup. Disabled filters/delays no longer depend on a future process frame to clear state. Active effects retain state, including across pause and unrelated settings. This covers engine-level pause and OFF/ON messages arriving before any process call. The public UI currently exposes Play/Stop, not pause; do not present the engine pause test as a UI feature.

paused-toggle.mjs checks seven effects in active/paused conditions (14 cases), using 0.5 seconds of history and comparing stereo re-enable output to a cleared-state reference at the same position. It also checks that pause/resume with unchanged enabled effects preserves continuous PCM. Prior active-bypass, transport/tail, WAV and limit regressions remain applicable. No new effect or tone parameter change.

## Spacebar routing (2026-10-07)

Spacebar dispatches at most one transport action per physical press. Held-key repeats are consumed, and disabled Play or an absent source blocks dispatch. Input, select, textarea and editable-text targets retain native keydown/keyup behavior. Existing Play/Stop or Play/Pause semantics and DSP are unchanged. Native confirmation dialogs keep their existing browser behavior.
