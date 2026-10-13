# Comb Amount — parameter clarification

Date: 2026-10-13. Step 2 of the Timbre parameter review. VERIFIED FOR RELEASE.

## Decision

Rename the visible Comb Mix parameter to **Amount**. Keep `combMix` and
`combMixParam` stable, range 0–1, default .85, percentage display, interpolation,
curve editing/reset, payloads, Preview and Render unchanged.

- 0%: original input to this effect stage.
- 100%: full comb result `(input + delayed)/2`.
- Intermediate amount a: `(1-a)*input + a*(input+delayed)/2`.
- Feedback controls recirculation; it is not a second Amount control.
- At Amount 0 the delay/feedback state still evolves; this is not effect Off.

The original/delayed sum creates the comb response. Changing 100% to delayed-only
would remove this feed-forward mixture and change existing sound. We retain it
and clarify the UI instead. Flanger, Chorus and Delay keep their Mix labels.

Toolbar: Amount. Active-curve title: Comb Amount. Legend: amount 0–100%, original
to comb. Tooltip explains that the comb result includes original plus delayed.
The graph continues to use the common percentage axis.

## Verification

The Comb engine files are byte-identical before/after this step (relative to the
already uncommitted Band Pass/MIX work). A dedicated test covers dry endpoint,
weighted blend, evolving feedback, range clamping, and realtime/offline kernel
parity. Listening approval is not inferred from unchanged code or numerical tests.

## Next

Review Flanger/Chorus Delay versus Depth boundaries, then compare the starting
presets by level-matched listening. Prior changes remain local and uncommitted.

Completed: endpoint/blend/clamp/feedback/kernel tests passed; unchanged engine
file hashes confirmed. Browser shows Amount/Comb Amount and the explanation;
point insertion, Clear Current back to 85%, Play/Pause passed without console
errors. Local served HTML/JS matches edited files. No new export or listening
certification is claimed for this label-only step.

## Release decision — 2026-10-13
User authorized commit and deployment of the accumulated Timbre changes.
The local-only statements above describe the implementation checkpoints.
Numerical/browser checks passed; comparative listening and cross-platform
validation remain separate. Deployment evidence is recorded in the shared QA workspace.
