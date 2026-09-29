# Timbre Curve Lab

Draw filter color onto sound.

Timbre Curve Lab is a browser-based classroom tool for electronic music and sound composition. Students can load an audio file, draw Low Pass, High Pass, Band Pass, Comb, Flanger, Chorus, and Delay curves over the waveform, then export the filtered result as a WAV file.

The audio file is processed locally in the student's browser. It is not uploaded to a server.

## Classroom Use

1. Open the website.
2. Click `Open Audio` and choose a short audio file.
3. Toggle `Low Pass`, `High Pass`, `Band Pass`, `Comb`, `Flanger`, `Chorus`, or `Delay` in the effect chain.
4. Use the left frequency axis to place cutoff or center-frequency values.
5. Draw cutoff points directly on the waveform. For Band Pass, use `Center` for the middle frequency and `Width` for the band thickness.
6. Use `Play` for a quick check.
7. Use `Download WAV` to export the transformed sound.
8. Use `Clear Current` to reset the curve, or `Reset All` to reset the project.
9. Import the WAV into a DAW, Max, or another composition environment.

## Why This Is Useful

Timbre Curve Lab helps students treat sound as flexible compositional material:

- Low Pass can brighten or darken the sound over time by changing the cutoff frequency.
- High Pass can thin or lighten the sound by removing low frequencies over time.
- Band Pass can isolate a moving frequency region with separate center-frequency and width curves.
- Comb can create metallic resonance, short echo color, and pitched delay effects with delay time, feedback, and mix curves.
- Flanger can create moving comb-filter sweeps with short delay, depth, rate, and feedback curves.
- Chorus can create wider, thicker doubled sounds with delay, depth, rate, and mix curves.
- Delay can create clear echoes from 100 ms to 1.5 seconds with feedback and mix curves.
- The effect chain uses one slot each for Low Pass, High Pass, Band Pass, Comb, Flanger, Chorus, and Delay.
- The result is a concrete WAV file students can reuse in their pieces.

The tool is especially useful before introducing more technical systems such as Csound, Max/MSP, modular synthesis, filter design, or custom DSP code.

## Current Engine

- Realtime `Play`: Web Audio API / AudioWorklet filter engine.
- `Download WAV`: browser-based offline filter export.

Downloaded files use stereo signed 24-bit PCM WAV and preserve the decoded source sample rate. The built-in sample normally follows the browser AudioContext rate, commonly 48 kHz.

This version is a classroom workflow prototype for curve-based timbre shaping. The current engine uses Low Pass, High Pass, Band Pass, Comb, Flanger, Chorus, and Delay so the first musical goal stays simple: draw a curve and hear the color of the sound change over time.

## Browser Compatibility

Recommended: Chrome, Edge, or Safari on a laptop or desktop browser.

The app uses standard browser audio features: Web Audio API, AudioWorklet, Canvas, and local file decoding. These are stable browser technologies, but audio-file decoding can vary slightly by browser and operating system. WAV, AIFF, MP3, and M4A are the safest formats to use in class.

For long-term maintenance, test the site once or twice a semester in the browsers used by students.

## GitHub Pages

This is a static website. It can be hosted directly with GitHub Pages from the repository root.

Public site: [https://hyunsukjun.github.io/timbre-curve-lab/](https://hyunsukjun.github.io/timbre-curve-lab/)

## Run Locally

```sh
cd /Users/hyunsukjun/Documents/Codex/2026-08-24/referenced-chatgpt-conversation-this-is-an/TimbreCurveLab
python3 -m http.server 5174
```

Then open:

```text
http://127.0.0.1:5174/
```

Do not use `file://` for regular testing. Browser audio features are more reliable through `localhost` or `https://`.

## Current Stage

This project is a public classroom prototype under active refinement. Its implemented web behavior is the current reference, while formal cross-browser listening tests and longer-file validation remain ongoing work.

## Product Documentation

The following files preserve product behavior separately from the current web platform:

- [Development guidelines](DEVELOPMENT_GUIDELINES.md)
- [Curve Lab design system](CURVE_LAB_DESIGN_SYSTEM.md)
- [Feature registry](docs/FEATURE_REGISTRY.md)
- [Parameter specification](docs/PARAMETER_SPEC.md)
- [Interaction specification](docs/INTERACTION_SPEC.md)
- [DSP behavior](docs/DSP_BEHAVIOR.md)
- [Product decisions](docs/DECISIONS.md)
- [Standalone migration notes](docs/STANDALONE_MIGRATION.md)

## Curve Lab Development Principles

- Prefer stability, clarity, and classroom usefulness over adding many features quickly.
- Keep the first experience musical: users should understand sound changes through curves, time, and immediate listening before they need precise numbers.
- Add a feature only when it can be explained clearly in class, used meaningfully in composition, and added without making the main workflow harder to understand.
- Keep audio processing, curve editing, UI state, signal-chain order, and future preset/project storage as separate responsibilities where possible.
- Treat saved presets, examples, and exported project data as long-lived formats. Change their structure carefully so older work can still be opened when the app evolves.
- Give classroom feedback high priority, but do not redesign the whole system from a single class reaction. Look for repeated friction before changing the core structure.
- When adding a major feature or changing a data format, document the design reason briefly, not only the user-facing steps.
- Keep the visual signal path honest: the filter order shown in `Signal Chain` should match the realtime engine and WAV export order.
- Start from the original sound. Filters should be off by default, and only filters intentionally enabled by the user should affect the sound.
- Keep each filter type as a single module in the chain. The user may reorder filters, but the same filter should not appear multiple times in one project.
- Include protective gain and feedback limits for delay/feedback-based effects so students can explore extreme values without unsafe output.

## Recommended Student Notes

- Use short files first, around 5 to 30 seconds.
- Use a laptop or desktop browser.
- Chrome, Edge, and Safari are the first browsers to test.
- If the browser slows down, reload the page and use a shorter file.
- Downloaded WAV files are created by the browser and can be imported into a DAW.
