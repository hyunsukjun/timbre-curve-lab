# Timbre character starting presets — 2026-10-13

Status: VERIFIED FOR RELEASE; numerical/browser validation recorded below. Listening approval: TO BE VERIFIED. Release authorized by the user after verification.

## Research and interpretation

- [FabFilter Simplon: loading presets](https://www.fabfilter.com/help/simplon/presets/loadingpresets): a Default Setting is loaded at startup, with factory presets for exploring the tool. Adopt the distinction between a useful starting sound and a final musical decision.
- [Ableton Live audio effect reference](https://www.ableton.com/en/manual/live-audio-effect-reference/): describes filter roles, Chorus-Ensemble and Phaser-Flanger, and adjustable dry/wet balance. Its Delay Tips give concrete effect recipes, distinct from universal initial values.
- [ValhallaDelay controls](https://valhalladsp.com/2019/04/16/valhalladelay-the-controls/): MIX 0% dry, 100% delayed, 50% equal blend; feedback controls repeated echoes.

These are design references, not copied factory presets. No common numeric standard is claimed. The values below are Curve Lab-specific candidates based on its own mappings and existing engine. Other plugins' filter topology, feedback scaling and mix laws differ.

## Starting values

| Effect | Working character label | Starting values | Reason |
|---|---|---|---|
| Low Pass | Dark | Cutoff 800 Hz | Distinct upper-frequency attenuation on broadband input |
| High Pass | Thin | Cutoff 900 Hz | Clear loss of body; distinct from subtle rumble removal |
| Band Pass | Focus | Center 1500 Hz, Q 3 (Width about 43.6%) | Concentrated mid band without the previous extreme Q 12 narrowing |
| Comb | Metallic | Delay 4 ms, feedback 0.72, mix 85% | 250 Hz comb spacing; resonant color without simply raising feedback |
| Flanger | Sweep | Delay 3 ms, depth 2.5 ms, rate 0.25 Hz, feedback 0.60, mix 50% | 0.5–5.5 ms steady-state sweep avoids the previous default lower-delay clamp plateau |
| Chorus | Ensemble | Delay 22 ms, depth 4 ms, rate 0.80 Hz, mix 50% | Doubling/modulation distinct from Flanger; less exaggerated pitch wandering than 10 ms depth |
| Delay | Echo | Time 320 ms, feedback 0.45, mix 40% | Clearly separated repeats at a moderate feedback setting |

Flat endpoint curves remain the defaults: the user supplies time shaping. Labels above describe intended character and are documentation labels, not an added preset browser. Effects remain disabled initially. Existing curves survive Off/On; Clear Current resets only the selected parameter and Reset All follows the existing scope. Dry baseline remains all effects Off. Old behavior is preserved in Git at commit 247d162 for later level-matched comparison.

## Flanger MIX contract

Add stable curve ID `flangerMix`, normalized 0..1 with existing smoothstep interpolation, full editing, percentage scale, live readout, reset and Preview/Render transfer. The local effect output is `input*(1-mix)+delayed*mix`, followed by the existing output gain/limiter. Feedback continues internally when mix is zero. 100% gives delayed-only modulation, not the strongest flange interference; 50% is the starting blend.

Missing/empty legacy offline MIX uses 0.54; legacy worklet curve messages without MIX use 0.54, preserving the old fixed blend. New UI explicitly sends 0.5. Feedback damping, delay interpolation, limiter and channel/LFO phase rules are unchanged. No resonance control or new oscillator/LFO is added.

## Verification / limits

Tests cover the seven starting presets and combined chain, stereo MIX 0/50/100%, moving MIX, legacy 54%, finite output, initial/reset consistency and Preview/Render equality after the same 48 kHz output conversion. Tests do not establish musical preference or equal perceived loudness. Comparative listening with sustained instrument, transient and broadband references is still required, especially for multi-effect chains. The current engine's separate export peak adjustment is unchanged.

### Verification results
- 45 stereo Preview/Render comparisons passed at 44.1/48/96 kHz, after identical export resampling.
- Ten existing suites passed: transport parity, chain gain, paused toggles, rate toggles, tails, keyboard, pending Play, WAV output/encoder and export recovery.
- Browser: Flanger MIX displayed 50%; point insertion and Clear Current worked; default noise and a 2 s stereo WAV played; Reset All returned effects to Off. Browser download verified as 48 kHz/24-bit stereo, 2.0 s. No console errors observed.
- Fixed stale filter readouts before playback: paused/initial Low Pass, High Pass and Band Pass values now derive from their current curves rather than the last worklet telemetry.
- Musical listening approval, Safari and Windows verification remain open.

## Release decision — 2026-10-13
User authorized commit and deployment of the accumulated Timbre changes.
The local-only statements above describe the implementation checkpoints.
Numerical/browser checks passed; comparative listening and cross-platform
validation remain separate. Deployment evidence is recorded in the shared QA workspace.
