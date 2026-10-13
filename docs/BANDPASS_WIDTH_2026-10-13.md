# Band Pass Width and gain correction — 2026-10-13

Status: VERIFIED FOR RELEASE; listening approval pending. This is step 1 of the parameter review. No deployment in this step.

## Contract

- Width changes bandwidth across normalized 0..1, retaining Q = 0.5 * 24^(1-y).
- Return the TPT state-variable band output multiplied by k=1/Q. The filter center has unity steady-state gain at every Width. This is not loudness normalization: removing bands may still make broadband material quieter, and modulation/transients can differ.
- Remove the Width >= .995 bypass branch in both Preview and Render. Width 100% is broad Q 0.5; use effect Off to hear unprocessed input at that stage.
- UI changes `full` to `wide` and shows Width percentage plus Q. Normalized parameter IDs/coordinates and default center 1500 Hz/Q3 remain.
- Band visualization remains a qualitative guide, not a measured frequency-response plot.

## Compatibility

An intentional audible correction: old narrow Band Pass curves no longer receive Q-dependent boost (Q3 formerly +9.54 dB, Q12 +21.58 dB at center, before output processing). Old Width=1 curves now remain band filtered. No project-file migration is claimed; existing browser tabs retain their loaded code until refreshed. The prior deployed engine remains available at Git commit 247d162. Other modules' algorithms, global gain, limiter and output encoding are unchanged.

## Verification

27 steady-state center-gain cases across 44.1/48/96 kHz, centers 100/1500/10000 Hz and Q .5/3/12 passed; maximum deviation below .000002 dB. At a 100 Hz test tone with center1500 Hz, Width .9949/.995/.9951/1 stays attenuated; crossing the old threshold changes gain by about .00543 dB rather than bypassing. This is numerical evidence, not listening approval.

Preview/Render regression includes Width0, .9949, .995, .9951, 1 and a moving Width curve. See tests/bandpass-width.mjs and tests/character-presets.mjs.

## Next bounded steps

2. Clarify Comb MIX semantics without silently changing its established sound.
3. Review Flanger/Chorus Delay versus Depth at boundary values.
4. Level-matched listening of the character starting presets; no automatic aesthetic approval.

### Completed checks
- Expanded character-presets suite: 63 stereo Preview/Render comparisons passed, including static boundary widths and automated Width at three sample rates.
- Existing transport parity, full-tail/replay and paused-toggle suites passed. All source syntax and diff whitespace checks passed.
- Browser: default noise playback, Width point insertion/Clear Current, percentage/Q display, 2 s stereo file input, playback and download passed. Saved WAV confirmed 48 kHz/24-bit stereo, 2.0 s; no console errors.
- Four changed served runtime files match local bytes. Screenshot: shared work/CurveLabWebV1/evidence/timbre-bandpass-width.png.
- No comparative listening, Safari/Windows validation or deployment performed.

## Release decision — 2026-10-13
User authorized commit and deployment of the accumulated Timbre changes.
The local-only statements above describe the implementation checkpoints.
Numerical/browser checks passed; comparative listening and cross-platform
validation remain separate. Deployment evidence is recorded in the shared QA workspace.
