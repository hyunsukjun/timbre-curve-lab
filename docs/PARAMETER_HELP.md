# Parameter help — 2026-10-14

UI-only. Live values, axes, enable states, parameter mappings and DSP are preserved.
Hover after 500 ms, keyboard focus immediately, touch selection; Escape/outside press/blur/scroll/resize dismiss. Help can be hovered.
Legacy legend nodes remain available to existing writers but are hidden; no lifecycle reference is removed.

- `lowpassMode`: **Low Pass · 40 Hz–18 kHz** — Set the cutoff frequency. Attenuates frequencies above it. The upper limit is reduced at lower processing sample rates.
- `highpassMode`: **High Pass · 40 Hz–18 kHz** — Set the cutoff frequency. Attenuates frequencies below it. The upper limit is reduced at lower processing sample rates.
- `bandpassMode`: **Band Pass** — Keep a band around the center frequency. Edit Center Frequency and Width separately.
- `combMode`: **Comb** — Combine the original with a delayed, recirculating signal for resonant comb filtering.
- `flangerMode`: **Flanger** — Sweep a short delay to create moving comb-filter notches. Edit delay, depth, rate, feedback and mix.
- `chorusMode`: **Chorus** — Modulate delayed voices to thicken the sound. Edit delay, depth, rate and mix.
- `delayMode`: **Delay** — Create repeating echoes. Edit delay time, feedback and mix.
- `bandpassCenterParam`: **Center Frequency · 40 Hz–18 kHz** — Move the center of the band-pass filter. The upper limit is reduced at lower processing sample rates.
- `bandpassWidthParam`: **Width · 0–100%** — Widen the pass band: 0% is narrow (Q 12), 100% is wide (Q 0.5). The filter remains active at every width.
- `combDelayParam`: **Comb Delay · 0.5–100 ms** — Set the delay that determines the spacing of comb resonances.
- `combFeedbackParam`: **Comb Feedback · 0–0.95** — Return part of the delayed signal into the delay. Higher values sustain resonances longer.
- `combMixParam`: **Comb Amount · 0–100%** — 0% is the original signal. 100% is the comb-filtered signal, which itself includes original and delayed sound.
- `flangerDelayParam`: **Flanger Delay · 0.5–10 ms** — Set the center delay for the modulation sweep.
- `flangerDepthParam`: **Flanger Depth · 0–10 ms** — Requested sweep depth. Effective depth is limited to Delay minus 0.25 ms.
- `flangerRateParam`: **Flanger Rate · 0.02–5 Hz** — Set how many modulation cycles occur each second.
- `flangerFeedbackParam`: **Flanger Feedback · 0–0.85** — Recirculate delayed sound to strengthen the resonant sweep.
- `flangerMixParam`: **Flanger Mix · 0–100%** — Balance original and delayed sound: 0% original, 100% wet.
- `chorusDelayParam`: **Chorus Delay · 10–35 ms** — Set the base delay of the chorus voices.
- `chorusDepthParam`: **Chorus Depth · 0–20 ms** — Requested sweep depth. Effective depth is limited to Delay minus 5 ms.
- `chorusRateParam`: **Chorus Rate · 0.02–3 Hz** — Set the chorus modulation speed in cycles per second.
- `chorusMixParam`: **Chorus Mix · 0–100%** — Balance original and chorus sound: 0% original, 100% wet.
- `delayTimeParam`: **Delay Time · 100 ms–1.5 s** — Set the interval between echoes.
- `delayFeedbackParam`: **Delay Feedback · 0–0.85** — Set how much delayed sound repeats through the delay.
- `delayMixParam`: **Delay Mix · 0–100%** — Balance original and echoes: 0% original, 100% wet.

Source audit: current app mappings and DSP core modules, cross-checked against PARAMETER_SPEC.md. No parameter values were changed.

## Validation and boundaries

All visible parameter buttons were exercised in the local browser; Oscillator FM/AM/Ring were separately checked after a same-control reopen fix. Escape dismissal and viewport containment passed; all six Labs also passed 540×800 help containment. Play/Pause state passed with default content for Audio, Timbre, Space, Spectral and Oscillator; Granular remained correctly disabled without a file. Family keyboard regression: 27 passed; all source JavaScript syntax and diff whitespace checks passed. No console errors observed in the captured smoke session. No DSP changes, new listening, export, physical touch, or cross-browser proof claimed. Pointer-hover delay is implemented; automated browser checks exercised focus/click rather than pointer hover. Family evidence: family-parameter-help-checks.json.
