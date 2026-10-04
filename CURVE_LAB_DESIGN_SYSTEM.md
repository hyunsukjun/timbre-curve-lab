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
