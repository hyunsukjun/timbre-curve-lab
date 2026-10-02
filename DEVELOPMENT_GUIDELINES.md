# Timbre Curve Lab Development Guidelines

## Product Priority

1. Preserve trusted sound and DSP behavior.
2. Preserve parameter meaning and fine tuning.
3. Preserve normalized curve data and interactions.
4. Preserve parameter and state identity.
5. Maintain the Curve Lab visual language.
6. Improve portability and polish only after the above remain intact.

The app is a compact musical sketchbook and teaching tool, not a general DAW. New features should be explainable in class, useful in composition, and compatible with the existing Open Audio -> Draw -> Preview -> Download WAV flow.

## Conceptual Architecture

### Product behavior

What the musician experiences: enabling effects, selecting parameters, drawing trajectories, hearing the chain, reordering it, and exporting the result.

### Processing and data model

Normalized `{x, y}` curve points, stable parameter IDs, mappings into musical units, enabled states, signal-chain order, interpolation, smoothing, DSP state, and export rules.

### Web implementation

HTML controls, CSS, Canvas, Pointer Events, Web Audio API, AudioWorklet, browser file decoding, and Blob download. These are replaceable platform details and must not become the only description of the product.

## Current File Responsibilities

- `index.html`: semantic controls and workspace structure.
- `src/styles.css`: Curve Lab design tokens, layout, component states, and responsive rules.
- `src/app.js`: UI state, curve editing, Canvas painting, file loading, transport coordination, and messages to the audio engine.
- `src/timbre-worklet.js`: realtime stereo Preview DSP and playback lifecycle.
- `src/offline-render.js`: offline DSP, delay tail calculation, and WAV encoding.
- `src/eraser-cursor.svg`: Eraser cursor asset.

Keep these responsibilities distinct when making incremental changes. Do not force a refactor merely to make the separation perfect.

## State And Parameters

- Parameter IDs are stable product identities. Display labels may evolve.
- Curves use normalized time and normalized parameter values in `[0, 1]`.
- Canvas pixels are derived presentation coordinates, never source data.
- Effects are disabled initially. Enabling adds one module to the end of the chain; duplicates are not allowed.
- Chain order is musical state and must affect Preview and Render equally.
- A future preset schema should be versioned and platform independent. No preset persistence exists yet.

## Curve Editing

- Store endpoints explicitly at normalized time 0 and 1.
- Preserve endpoint deletion protection.
- Keep interpolation behavior identical in Preview and Render.
- Resize, Retina scaling, and browser zoom must not modify curve data.
- Point hit testing may use screen coordinates, but stored values remain normalized.

## Audio Processing

- File bytes remain local to the browser.
- Realtime and offline engines should share one written specification even where AudioWorklet isolation requires separate code.
- Any change to a mapping, coefficient, smoothing rate, limiter, gain, tail, or channel rule must be applied and tested in both engines.
- Avoid automatic normalization or always-on processing changes without explicit musical justification.
- Preserve sample rate when the current browser-decoded source is stable; do not force resampling without a requirement.

## Canvas And Responsive UI

- Canvas is the primary workspace.
- Use device-pixel-ratio backing resolution and normalized pointer mapping.
- Keep the current horizontal-scroll strategy for the fixed minimum workspace width unless a tested replacement is approved.
- Verify narrow laptop and wide desktop layouts after structural UI changes.
- Preserve system fonts and avoid external UI/font dependencies.

## Compatibility And Performance

- Primary targets: current desktop Chrome, Edge, and Safari.
- Firefox and Windows require explicit validation before claiming support.
- AudioWorklet requires localhost or HTTPS in normal deployment.
- Offline rendering yields periodically to the main thread, but long files remain memory and CPU intensive.
- Current source rendering is capped at 180 seconds; delay tails can add up to 10 seconds.

## Testing Policy

Use the smallest test set that still exercises the affected lifecycle. Audio changes should include a percussive source, steady tone, noise, and ordinary music where feasible. Distinguish:

- code verified,
- browser behavior verified,
- measured file/output verified,
- subjective listening verified,
- unverified.

Do not label syntax success or a valid WAV header as a completed listening test.

## Documentation Policy

Documentation is part of completion. Record current values and reasons where known. Never invent historical rationale or listening approval. Preserve previous fine-tuning values in `docs/DECISIONS.md` when a meaningful value changes.

For a listening-led DSP change, also record the source, curve fixture, monitoring context, comparison baseline, audible result, and acceptance decision in `docs/FINE_TUNING_LOG.md`. A value without this evidence is an implementation fact, not a verified musical decision.
