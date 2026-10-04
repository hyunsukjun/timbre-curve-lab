# Timbre Curve Lab Agent Rules

This repository is the Timbre Curve Lab product. Its current web implementation is a reference implementation; its musical behavior, parameter meanings, curve data, interactions, and documented decisions are the long-lived product assets.

## Before Any Change

1. Inspect the current repository and running behavior before editing.
2. Prefer evidence from code and execution over assumptions or sibling projects.
3. Keep work limited to Timbre Curve Lab unless another repository is explicitly requested.
4. Treat Audio Curve Lab only as a shared visual-language reference. Do not copy its DSP or product structure into this project.
5. Report any conflict between code, documentation, and observed behavior instead of silently choosing one.

## Protection Rules

- Preserve existing audio and DSP behavior unless the request explicitly changes it.
- Keep UI work separate from DSP work.
- Do not rename stable parameter IDs without a migration plan.
- Do not change the normalized curve coordinate system for styling convenience.
- Preserve Pen, Eraser, endpoint protection, Command/Ctrl temporary erase, and keyboard shortcuts.
- Preserve Preview and Render behavior together; investigate both paths for DSP changes.
- Do not add dependencies, frameworks, backends, uploads, analytics, or accounts without a clear approved need.
- Do not perform broad refactors unless explicitly requested.
- Do not commit, push, or deploy unless explicitly requested.

## Documentation Definition Of Done

- New or changed feature: update `docs/FEATURE_REGISTRY.md`.
- Parameter identity, range, default, unit, or mapping: update `docs/PARAMETER_SPEC.md`.
- Gesture, tool, shortcut, or state transition: update `docs/INTERACTION_SPEC.md`.
- Algorithm, smoothing, gain, limiter, channel, Preview, or Render behavior: update `docs/DSP_BEHAVIOR.md`.
- Important product or architecture decision: update `docs/DECISIONS.md`.
- Standalone portability impact: update `docs/STANDALONE_MIGRATION.md`.
- Shared visual language or token: update `CURVE_LAB_DESIGN_SYSTEM.md`.
- Reference input, curve fixture, expected measurement, or listening procedure: update `docs/REFERENCE_SOUND_SET.md`.
- Listening-led parameter adjustment: append the evidence and result to `docs/FINE_TUNING_LOG.md`.

Documentation must describe current behavior, not desired behavior. Mark unimplemented ideas as `PROPOSED`, unknown intent as `UNKNOWN`, and unverified listening claims as `TO BE VERIFIED`.

## Verification

Scale verification to the change. For audio or interaction work, check initialization, default sample, real audio loading, Play/Stop/natural end/replay, all affected parameters, curve editing, Preview, WAV export, channel count, output length, browser console, syntax, and actual served files. Syntax checks and headers alone do not prove audible correctness.

## Identity Pilot

Use Hub v0.10 canonical Timbre #F4CB38 and retained v0.9 symbol for product identity.
See `docs/IDENTITY_PILOT.md`; preserve independent effect/parameter colors.
