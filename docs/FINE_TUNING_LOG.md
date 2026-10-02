# DSP Fine-Tuning Log

This log preserves listening evidence. It is not a changelog and must not be filled from assumption. Keep rejected experiments because they prevent the same unsuccessful approach from being repeated during standalone development.

## Entry Template

### YYYY-MM-DD - Short experiment name

- **Status:** `PROPOSED / TESTED / ACCEPTED / REJECTED / TO BE VERIFIED`
- **Build or commit:**
- **Effect and parameter:**
- **Previous value:**
- **Test value:**
- **Variables held constant:**
- **Reference source:**
- **Curve fixture:**
- **Chain order:**
- **Preview environment:**
- **Render format:**
- **Monitoring context:**
- **Audible result:**
- **Artifacts or measurements:**
- **Preview/Render difference:**
- **Decision and reason:**
- **Standalone requirement:**

## 2026-09-30 - Recognizable Delay-Family Defaults

- **Status:** `ACCEPTED AS CURRENT PRODUCT BASELINE; FORMAL REFERENCE-SET LISTENING TO BE VERIFIED`
- **Build or commit:** `fa65f46`
- **Effect and parameter:** Comb, Flanger, Chorus, and Delay default curves.
- **Previous value:** Comb 8 ms / 0.50 Feedback / 80% Mix. Other prior defaults are preserved in Git history but do not have a complete listening record.
- **Test value:** Comb 8 ms / 0.80 / 90%; Flanger 2 ms / 6 ms / 0.30 Hz / 0.65; Chorus 22 ms / 10 ms / 0.65 Hz / 55%; Delay 420 ms / 0.48 / 42%.
- **Variables held constant:** Existing algorithms, mappings, damping, limiter, output gain, and chain behavior.
- **Reference source:** Built-in percussive white noise and informal user material; exact retained sources are `UNKNOWN`.
- **Curve fixture:** Fixed default endpoint curves.
- **Audible result:** Each effect became more immediately recognizable for teaching and first activation.
- **Artifacts or measurements:** Comb export was previously confirmed as stereo signed 24-bit PCM; formal fixed-fixture metrics are `TO BE VERIFIED`.
- **Decision and reason:** Accepted as defaults because perceptual recognizability and educational clarity are more useful than neutral settings.
- **Standalone requirement:** Preserve these defaults unless a documented A/B test approves a replacement.

## 2026-09-30 - High-Frequency Liveliness Question

- **Status:** `PROPOSED`
- **Build or commit:** `fa65f46` baseline.
- **Effect and parameter:** Feedback damping first; interpolation, wet/dry balance, source-rate conversion, and limiter only in later isolated tests.
- **Previous value:** Comb/Delay damping 0.22; Flanger damping 0.35.
- **Test value:** Not selected.
- **Variables held constant:** One parameter at a time; preserve output gain, limiter, curves, chain order, and source.
- **Reference source:** Seeded noise, percussion, harmonic instrument, and ordinary music fixtures once committed.
- **Curve fixture:** Fixed, slow, fast, and extreme cases.
- **Audible result:** Current engine is clean, moist, and musically convincing, but may feel short on high-frequency saturation, surface grain, transient edge, or liveliness.
- **Artifacts or measurements:** No confirmed defect and no formal A/B measurement yet.
- **Decision and reason:** Preserve the current build as baseline. Do not compensate with an indiscriminate treble boost.
- **Standalone requirement:** Any brighter replacement must retain stability and be accepted against the same fixed sources in both Preview and Render.
