# Functional surface contract — 2026-10-15

Status: Timbre approved for release on 2026-10-15 after scoped verification. Audio is the reference; Timbre is the first detailed parity pass. Other Labs are not yet certified against every rule below.

## Roles and exact values
- Upper title, feature buttons, settings, current values: #373B43, one continuous surface.
- Waveform and its tools/navigation surround: #252C32. Canvas paint and CSS must agree. Do not add audio editing to Labs which only display a waveform.
- Curve drawing canvas: #191C20.
- Transport surround: #30343C, shared edges, no inset card margin; control group #292F37, border #596472.
- Transport hover #343A42; playing #5C6978. Neutral button icons remain neutral.
- Elapsed time uses #459BFF and remaining time #8290A1. Transport progress is a shared functional color, not each Lab brand color.
- Meter uses Audio's continuous green/yellow/red gradient with thin #788492 outline. Remove inherited segment dividers. CLIP off uses #262E38 background, #5C6878 border, #B3BECC text; retain actual clipping state.
- Active effect/parameter colors remain product-specific; do not flatten states to match neutral surfaces.

## Information
Timbre removes the redundant Signal Chain heading while retaining the chain, reordering and its accessible label. Remove idle WAV ready/not ready/needs export text; preserve progress, cancellation, limits and errors. This is not authorization to hide important failure information.

## Review gate
Check final computed styles, not only token files: original CSS, later overrides and Canvas drawing can differ. Inspect idle/playing/disabled/clip, remaining-time visibility, expanded controls, narrow widths and normal desktop. Check playback, seek, export feedback and error affordances. Record scoped evidence; don't claim full family parity until checked. Future edits should change this contract with an explicit rationale rather than invent local values.

## Precedence
This refines the continuous-shell rule: group by functional role, not one tone per row. It supersedes earlier navy transport remnants and Lab-colored timeline fill. Existing shared button sizing/state contract and all musical semantics remain intact.

## Scope correction from user review
Color/minor-UI work must not introduce new disclosures or change information hierarchy. Timbre restores always-visible Curve/Points/Engine/Value readouts and removes the Clear Current divider. The previously removed idle WAV status stays removed. Existing value calculation semantics remain unchanged. This supersedes the Timbre density pilot disclosure.

Readout-restoration check: Details count 0, Clear Current divider 0px, all four readouts visible; playback/pause/rewind and keyboard tests passed, no captured browser errors or horizontal overflow at 938 CSS px. Timbre release verified below.

## Release verification
1422/711 CSS px, no horizontal overflow; computed header/waveform/transport colors match contract. Flanger/Depth selection, playback with active meters, pause/rewind, output waveform ArrowRight seek to 1 second, actual WAV download (8 seconds, stereo, 48 kHz, 24-bit PCM) passed. No captured browser errors. Syntax, transport keyboard, all effect paused-toggle and five cancel/re-render recovery cycles passed. No DSP edits or comparative listening claim.

## Waveform/transport refinement — 2026-10-15
User review supersedes the waveform #252C32 role above for Timbre: waveform and curve now share #191C20, with a non-interactive 1px #46515E separator. Transport keeps Audio/Space #30343C, neutral controls #292F37, and now aligns to the shell edges; no inset footer margin. Existing colors of effect curves, selection states and metering are retained. No DSP or timing changes.

### Timbre lower-surface exception — 2026-10-15
Explicit user review overrides the shared #30343C transport surround for Timbre: both transport surround and signal-chain background now match waveform/curve paper #191C20. Buttons, meters, separators, layout and processing remain unchanged. This is a Timbre-specific exception, not a family-wide token change.

### User clarification — lower panels, 2026-10-15
Supersedes the immediately preceding dark lower-surface exception: signal chain and transport surrounds use the title surface #373B43. Remove their outer borders/dividers and rounded panel edges; contrast with the #191C20 curve canvas provides grouping. Internal button/meter boundaries remain. The waveform/curve separator from the earlier explicit request remains; this correction concerns the lower panels.

## Content rails — 2026-10-15
Title/icon, effect controls, expanded parameter controls, current values, waveform/curve frames, signal-chain contents and transport contents share 20px left/right insets (10px at <=600px). Full-width background bands remain. Canvas internal scales and normalized data remain unchanged; responsive canvas resizing continues to determine backing dimensions and pointer mapping.

Content-rail correction: editor surround/gutters use #373B43, so the dark waveform and curve backgrounds stop at the shared inset instead of visually extending to the shell edges. Canvas dimensions, interactions and DSP are unchanged by this background-only correction.
