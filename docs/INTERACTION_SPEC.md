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
