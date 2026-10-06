# Reference Sound Set

Status: `SPECIFIED, FIXED AUDIO FILES AND ACCEPTED RENDERS NOT YET COMMITTED`

## Purpose

This set is the repeatable listening and measurement vocabulary for Timbre Curve Lab. It prevents a future web or standalone engine from being judged only by memory or by a newly randomized default sample.

It must answer four questions:

1. Does the parameter reach the intended musical range?
2. Does a moving curve remain smooth and responsive?
3. Do Preview and Render preserve the same character?
4. Does a standalone implementation preserve the accepted sound rather than merely matching labels?

## Fixed Source Fixtures

All future fixture WAVs should be 48 kHz, stereo, floating source values below -6 dBFS, and 8 seconds unless the fixture says otherwise. Files are `PROPOSED` until committed and measured.

| Proposed file | Content | Primary use |
|---|---|---|
| `reference-sine-1khz.wav` | Steady 1 kHz sine | Gain, limiter, modulation side effects |
| `reference-impulse.wav` | Isolated impulses with silence | Clicks, tails, filter response, timing |
| `reference-noise-seeded.wav` | Deterministic broadband noise with the documented interval envelope | Filter movement and repeatable A/B |
| `reference-percussion.wav` | Dry short transients | Attack clarity, comb/flanger coloration, zipper noise |
| `reference-harmonic.wav` | Sustained harmonically rich instrument | Resonance, chorus, high-frequency liveliness |
| `reference-music.wav` | Short ordinary musical excerpt with permission to retain | Musical usefulness and chain-order comparison |

Do not use the automatically generated page-start noise as a sample-identical fixture. It uses unseeded randomness.

## Curve Fixtures

Store these as normalized point lists in a future versioned JSON fixture file. Until that file exists, the definitions below are the required cases.

| Case | Meaning |
|---|---|
| Fixed | Two equal endpoints at the approved default |
| Slow rise | `{0, 0.15}` to `{1, 0.85}` |
| Slow fall | `{0, 0.85}` to `{1, 0.15}` |
| Fast alternating | At least eight alternating low/high interior points |
| Minimum | Two endpoints at 0 |
| Maximum | Two endpoints at 1 |
| Dense transition | Two or more points separated by a very small normalized time |
| Chain A/B | The same enabled modules in two documented orders |

Band Width must additionally test `0`, `0.5`, `0.994`, and the full-band bypass threshold `0.995`. Delay-based effects must test low, default, and maximum feedback at safe monitoring level.

## Measurements To Record

- source and output sample rate,
- channel count and channel order,
- duration and tail duration,
- peak and RMS per channel,
- non-finite sample count,
- DC offset,
- output sample count,
- WAV codec and bit depth,
- Preview/Render alignment where capture is available,
- browser or standalone build identifier.

## Listening Record

For every accepted reference render, record:

- source fixture and curve fixture,
- effect chain order,
- parameter values,
- monitoring device and approximate level,
- audible result,
- artifact check,
- comparison baseline,
- accept/reject decision and reason.

Use `FINE_TUNING_LOG.md` for the dated result. A valid WAV header or successful automated measurement is not listening approval.

## Current Evidence

- A prior local Comb export was measured as an 8-second, 44.1 kHz, stereo, signed 24-bit PCM WAV.
- Current default values and output metering have been exercised in the browser.
- Formal fixed-fixture Preview/Render captures and cross-browser listening approval are not yet committed.

## Standalone Acceptance

A native build is not sonically equivalent until it has been compared with the same fixed sources, normalized curves, chain orders, and accepted web reference renders. Differences caused by improved sample-rate conversion or corrected reset behavior must be named and approved rather than hidden inside an implementation rewrite.

## Technical Export Evidence (2026-10-06)

Not a musical listening approval: `tests/browser-wav-output.html` checks 44.1/48/88.2/96k
60-second synthetic stereo signals, exported WAV re-decode, 1-second source + 100ms
Delay tail, 30k stopband rejection, channel relationship and cancellation.
`tests/wav-output.mjs` covers the converter's identity, timing, gain and rejection.
The family work log retains 18 comparisons to the pre-change renderer, including
byte-identical 48k results, and a downloaded 10.2s WAV from a 6s source with default
Delay. Real music, long tails at high feedback, and device listening remain open.

## 2026-10-06: Synthetic gain boundary fixture

`tests/chain-gain.mjs` passes six reorder cases (three chains, playing/internal pause): reversing then restoring order before processing preserves the next 4096 stereo frames exactly. Processing reversed orders remains finite. Six 48k dry-tone amplitude cases confirm Preview/Render equality below final normalization and the documented Render-only scale above it (peak 0.995 to 0.98, -0.13194 dB; scale-adjusted error < 3.2e-8). No gain/limiter policy was changed. These are engine measurements, not reorder-click listening, all-permutation coverage, or device performance certification. The local bypass/reset fix is ready for a scoped commit and deployment; neither was performed in this step.
