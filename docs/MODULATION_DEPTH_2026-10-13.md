# Flanger / Chorus Delay–Depth contract — 2026-10-13

Status: VERIFIED FOR RELEASE; user authorized commit and deployment. Listening approval: TO BE VERIFIED.

## Problem and chosen behavior

Previously a symmetric sine modulation was clipped at the delay floor. Large
Depth combined with small Delay therefore held the read position at the floor
for a portion of each cycle. Keep Delay as the center and constrain the sine
amplitude instead; do not shift the center or reinterpret existing normalized
curve IDs/ranges.

- Flanger: `effectiveDepth = min(requestedDepth, max(0, smoothedDelay - 0.25 ms))`.
- Chorus: `effectiveDepth = min(requestedDepth, max(0, smoothedDelay - 5 ms))`.
- Read delay: `smoothedDelay + sin(phase) * effectiveDepth`.
- The existing final floor guard remains for numerical defense, not waveform clipping.
- Depth still requests 0–10 ms / 0–20 ms respectively. Stored curves are untouched.
- Above the available depth, further increases do not increase the sweep; the
  UI explicitly displays requested and effective depths when limited.

Examples: Flanger Delay .5/Depth10 -> .25 ms effective, range .25–.75 ms.
Chorus Delay10/Depth20 -> 5 ms effective, range5–15 ms.
Current character defaults remain unrestricted: Flanger3/2.5 -> .5–5.5 ms;
Chorus22/4 ->18–26 ms (including the existing initial smoothing from18 ms).

The effective amplitude follows the *smoothed* delay each sample, not merely
its target curve. This removes the static LFO floor plateau; it does not promise
artifact-free arbitrary automation, inaudible pitch modulation, or no aliasing.
Feedback damping, read interpolation, mix, output gain/limiter and LFO phase/rate
remain unchanged. Extreme combinations intentionally sound different from the
old clipped trajectory. This is not through-zero flanging.

## UI

Delay/Depth tab tooltips and parameter legend explain the relationship. For
limited Depth the readout shows e.g. `5.0 ms → 2.75 ms effective`.
Stopped display uses the requested Delay at the cursor (settled target); playing
display uses the worklet's left-channel effective depth telemetry. Both channels
have the same delay smoothing/depth limit but retain their distinct LFO phases.
The stored curve, point labels and axis remain requested depth, not overwritten
by the effective value. No dynamic axes or destructive parameter remapping.

## Checks

`tests/modulation-depth.mjs`: 54 rate/center/depth configurations across
44.1/48/96 kHz, zero/default/maximum depth, complete sampled LFO cycles; verifies
sinusoidal trajectories and absence of floor plateaus. Moving Delay tests verify
finite read positions and lower bounds. `tests/character-presets.mjs` additionally
compares stereo Preview/Render for extreme static and moving Delay/Depth curves.
Comparative listening and Safari/Windows remain unverified.

### Completed verification
- Trajectory suite: 54 cases passed; extended stereo Preview/Render suite: 81 cases passed across three rates after common export resampling.
- Existing transport parity, full-tail/replay, rate-toggle and paused-toggle suites passed. Syntax and whitespace checks passed.
- Browser: Flanger Depth curve editing/seek showed requested5.0 → effective2.75 ms; live telemetry updated during playback. Chorus default Depth4.0 ms displayed.
- A 2 s stereo WAV was imported and played through Flanger+Chorus. Downloaded WAV verified as stereo48k/24-bit,96000 frames. No console errors observed. Four served runtime assets match the local files.
- Local/uncommitted; no new public deployment.

## Release decision — 2026-10-13
User authorized commit and deployment of the accumulated Timbre changes.
The local-only statements above describe the implementation checkpoints.
Numerical/browser checks passed; comparative listening and cross-platform
validation remain separate. Deployment evidence is recorded in the shared QA workspace.
