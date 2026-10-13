# Curve Lab Design System: Timbre Application

Version: 1.0  
Product: Timbre Curve Lab  
Brand color: Yellow Gold `#F4CB38` (Hub v0.10)

## Visual Principle

All Curve Labs share a quiet deep-navy and charcoal workspace. Timbre Curve Lab is identified by the top-left icon and the `Curve Lab` title accent in Gold. Gold is not a replacement for parameter colors.

The hierarchy is:

1. Brand and Header
2. Effect, tool, and parameter controls
3. Thin status/readout strip
4. Canvas workspace
5. Signal Chain
6. Bottom transport, Position, and output monitoring

Canvas remains the dominant work area. Decorative effects must never reduce curve, point, waveform, or text legibility.

## Current Tokens

| Meaning | Web token | Current value |
|---|---|---|
| Deep background | `--cl-bg-deep` | `#050b12` |
| Workspace background | `--cl-bg` | `#07111c` |
| Surface | `--cl-surface` | `#0d1b29` |
| Raised surface | `--cl-surface-raised` | `#122438` |
| Hover surface | `--cl-surface-hover` | `#182f46` |
| Active surface | `--cl-surface-active` | `#1b3751` |
| Border | `--cl-border` | `#203a52` |
| Strong border | `--cl-border-strong` | `#345672` |
| Primary text | `--cl-text` | `#e8f0f6` |
| Secondary text | `--cl-text-secondary` | `#aabccc` |
| Muted text | `--cl-text-muted` | `#71889b` |
| Timbre brand | `--cl-accent` | `#F4CB38` |
| Focus | `--cl-focus` | `#F9E49B` |
| Danger | `--cl-danger` | `#e35d80` |

Geometry uses 4, 6, and 8 px radii; 4, 8, 12, 16, and 24 px spacing; a 38 px general control height; and a 54 px toolbar target height. The font stack is the operating-system UI stack.

## Parameter Colors

Parameter colors communicate meaning and remain separate from brand identity.

| Semantic use | Color |
|---|---|
| Low Pass, Band Width, Mix | Blue `#6FA8DC` |
| High Pass, Flanger Rate | Red `#EB6F75` |
| Band Center, Feedback, Chorus Rate | Green `#8FCF7A` |
| Delay Time | Gold `#F2B705` |
| Modulation Depth | Violet `#B887F4` |
| Flanger module | Mint `#6DE0C0` |
| Chorus module | Orange `#D99058` |

These colors belong on curve lines, points, legends, active parameter borders/backgrounds, and parameter-specific tooltips. Do not recolor all curves Gold.

## Components And States

- Header: icon, product title, short description, local-processing message, file open, and WAV export.
- Effect button: neutral when bypassed, semantic color when enabled, and a stronger bottom indicator when currently edited.
- Pen/Eraser: two-part icon toggle; selected tool is visible through button state and Canvas cursor.
- Status strip: compact five-column readout for Curve, Points, Engine, Value, and WAV.
- Canvas: dark surface with major/minor grid, muted blue-gray waveform, active curve, subdued inactive curves, control points, value feedback, and playhead.
- Signal Chain: Input and Output terminals with one draggable block per enabled effect.
- Bottom playback bar: Play, Stop, one elapsed/total clock, Position slider, and responsive final L/R meter with peak hold and CLIP reset.

Disabled controls must remain readable but clearly unavailable. Hover is a small surface/border change. Keyboard focus uses a visible 2 px Gold outline.

## Motion And Accessibility

- Ambient background movement is low opacity, slow, and pointer transparent.
- `prefers-reduced-motion: reduce` disables ambient animation and component transitions.
- Button state is not communicated by color alone: border, background, text, and the active bottom marker work together.
- Controls retain semantic HTML and accessible labels/pressed states.

## Portability Notes

CSS custom properties are the current web representation. A future native app should preserve their semantic roles, not necessarily their names. Canvas line widths and point sizes should be translated for the target display scale while keeping active/inactive hierarchy and hit areas consistent.

## Hub Identity Pilot — 2026-10-04

`PROJECT-SPECIFIC`: use the pinned Hub v0.10 palette and its preserved Timbre v0.9
three-layer tapered symbol. Header and favicon copy original symbol/micro SVGs.
`--cl-accent` aliases `--curve-lab-timbre` from `assets/identity/tokens.css`.
Focus #F9E49B and hover #F7D972 are web derivatives, not suite brand colors.
Download WAV uses a dark accent-derived fill to keep light text legible.
Effect colors, including Delay Time Gold #F2B705, remain independent and unchanged.
Details and source hashes: `docs/IDENTITY_PILOT.md`, `assets/identity/palette.json`.


## Waveform above curves (2026-10-13)

The existing output-time/source-guide waveform now appears above the curve editing
canvas, following the shared Curve Lab reading order. Its source-guide meaning,
click/drag/keyboard seek, parameter IDs, normalized curves and DSP remain unchanged.
This is a layout change only; Audio's output deletion/fades are not added here.


## Common bottom transport — 2026-10-13
COMMON CANDIDATE, implemented locally. Audio reference adopted: Return to start,
Play, Pause, output-position slider, time, continuous green/yellow/red stereo meter,
CLIP. Neutral 16px icons are centered inside 38x32px buttons; 34px slider hit area.
Return to start seeks to zero while preserving playing/paused state. Pause retains
position; Play resumes; Space toggles Play/Pause outside editable controls.
Internal reset stops for import/export/settings remain distinct and unchanged.
No DSP algorithm or output format changes. Resume uses this Lab's existing engine
initialization; continuous-sample-identical resumption is not promised.
The existing waveform guides remain in their existing locations.
OUT and numeric meter values are visually removed (values remain accessible).
Meter color fields are clipped at the level, not stretched; retain analysis,
ballistics, peak hold and CLIP semantics. Shared CSS/module are vendored locally,
with per-Lab adapters and no external runtime dependency.
Oscillator retains its existing source-duration seek cap for convolution tails.
Verification covers syntax, keyboard contracts and browser layout; file-based
Labs also exercised silent-WAV pause/resume. Audible listening, Safari/Windows,
long-file performance and Oscillator mode-specific listening remain separate QA.

## Flanger Mix — 2026-10-13
Mix is the fifth Flanger parameter tab, using the existing mix color #6fa8dc,
0–100% axis and percentage readout. No new panel or preset browser is introduced.

## Band Pass width labeling — 2026-10-13
Use narrow / wide for the Width axis and show percentage plus Q in the value
readout. Maximum width remains filtered, so do not label it full or bypass.

## Comb Amount label — 2026-10-13
Use Amount for Comb only; retain its existing percentage axis and color. The
legend and tooltip distinguish original-to-comb blending from delayed-only Mix.

## Effective Depth readout — 2026-10-13
Keep requested-depth axes and curves. When limited by Delay, append the actual
effective depth in milliseconds to the readout, with explanatory tab tooltip.


## 2026-10-14 — Common Clear Current / Reset All appearance
Both actions follow Audio's neutral navy reference: background #122438, text #aabccc, 6px radius, 13px/620 type, 92px minimum width, 38px height (30px at >=900px viewport width). Clear border #3b5063; Reset border #203a52. Shared hover/pressed/focus/disabled styles live in src/curve-actions.css. Red action emphasis is removed; brand/parameter colors elsewhere stay independent. Existing IDs, handlers, reset scope, confirmation mechanism and keyboard behavior remain unchanged. This is a local visual update, separate from DSP verification.
