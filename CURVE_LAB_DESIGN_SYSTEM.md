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


## 2026-10-14 — Family file information

Approved circular dotted-i disclosure immediately left of Open Audio. Default format guidance moves into this optional panel; privacy and actual error/status notices remain. Space operates disclosure without audio transport; Escape/outside click dismiss. Output guidance: Source up to 3 min, plus effect tail · Stereo · 48 kHz / 24-bit WAV. Input limits reflect current implementation, not a device-memory guarantee. No DSP, admission, export, IDs or defaults changed.


## 2026-10-14 — Family parameter help

Static parameter descriptions are available on the relevant buttons using the Audio help design; current values, axes and activation feedback remain visible. See `docs/PARAMETER_HELP.md` (or `PARAMETER_HELP.md` in this directory). No DSP or curve mapping changes.


## 2026-10-14 — Open Audio keyboard access
파일 입력을 display:none 대신 시각적으로만 숨겨 Tab과 Enter/Space로 기본 파일 선택기에 접근하도록 수정. 포커스는 기존 fileButton:focus-within 윤곽선으로 표시한다. 파일 디코딩·처리 계약은 변경하지 않는다.


## 2026-10-15 — Studio family visual pilot (local)
Reference: approved Audio design, commit 3e9723b. Apply deep cool-grey surfaces,
high-contrast typography, continuous panel boundaries and framed meters through
src/studio-theme.css. Preserve this Lab's brand accent, effect identities,
parameter mapping, feature layout and audio engine. No JS/DSP change.
This is a local first-pass candidate, not deployed; Canvas-rendered colors remain
the current implementation pending individual visual review. Narrow transport
uses document flow to avoid covering the editor. Listening is not implied.

Pilot smoke evidence: 1422px viewport, no horizontal overflow; default initialization and one parameter/effect selection verified; no browser errors captured. No full audio lifecycle, narrow/zoom certification or listening repeated. Only HTML/CSS/documentation changed.

### 2026-10-15 — Canvas alignment and zoom verification

- Canvas paper `#191C20`; neutral minor/major grid `rgba(139,149,162,.08/.18)`, matching the approved Audio direction. Parameter colors and audio processing are unchanged.
- Local browser: 800 CSS px viewport; actual Brave 125% (952 CSS px, DPR 2.5) and 150% (793 CSS px, DPR 3). No document horizontal overflow in any of the five Labs. Narrow layouts use vertical scrolling.
- Parameter selection and Clear Current smoke passed in all five; no captured console errors. Timbre play/pause/rewind smoke passed.
- Oscillator only: narrow-screen curve minimum height 220 px prevents crowded frequency labels; expanded Synthesis detail remains accessible.
- Syntax, keyboard tests and whitespace checks passed. Evidence: family workspace `evidence/family-studio-zoom-checks-20261015.json` and `*-studio-150-20261015.png`.
- Not a listening approval or a complete Safari/Windows regression. Local changes only; release decision remains pending.
- Additional targeted lifecycle/render regression suites passed; full results in family `UI_DESIGN_FAMILY_CANVAS_2026-10-15.md`.

## Common button states — 2026-10-15

`src/button-states.css` is the identical six-Lab contract, loaded after studio-theme.
Available off/bypassed: Audio reference gradient #363F4B → #2D3540, text #F0F3F7, edge #626C79. Unavailable: #353B44 / #949EAC / #495360 at full opacity. Selected: preserve existing parameter-specific fill, text and border colors, replace text underline with a full-width dark lower inset bevel (3 px). Focus remains independent. No hit-target, state, DSP or timing changes.

### Common role dimensions — 2026-10-15

- Main text buttons: 13px, weight 500, line-height 18px; 4px corner radius.
- Open/Download/Save: 38px high. Parameter/effect/waveform/synthesis mode/chain/action/dialog buttons: 34px.
- Pen/Eraser: 32px with shared 4px outer group; joined inner edges remain square. Transport: 32px, existing 3px corners and CSS glyphs retained.
- Audio edit helpers: 26px, 11px text; zoom symbols 14px. Fade handles are excluded.
- Secondary status text 12px; readout labels 11px, strong values 14px. Parameter colors and state semantics unchanged.
- Verified all six at 1422px and 640px CSS widths: no document horizontal overflow or measured button text clipping. Representative mode switching passed; Timbre Flanger expanded controls inspected, Audio Pen/Eraser and zoom/Fit exercised. Keyboard regression and diff whitespace checks passed.
- This is CSS-only verification, not fresh audio/export or listening certification. Local changes remain unpublished.

## Current precedence
See `docs/SHARED_VISUAL_CONTRACT.md` for the accepted shared baseline and resolution of older pilot conflicts. Newer role/state rules supersede old underline and 30px compact-button guidance.

## Information-density pilot — local review, 2026-10-15

Selected parameter name/value stays visible; statistics and full value overview are disclosed on demand. WAV status belongs beside Download. All original readout IDs and update sources retained. Playing: existing engine telemetry; stopped: existing curve target/effective-depth formatting at playhead. No filter selected stays --.

Details Space key is isolated from transport. Source/output distinction, off/enabled state and channel information must not be erased by family visual consistency. This is a COMMON CANDIDATE / STANDALONE ASSET pending visual approval; no commit/deploy.

## Functional surfaces
See docs/FUNCTIONAL_SURFACE_PILOT.md. Upper controls share the title background; waveform/analysis area has its own uniform surface. This refines continuous-shell styling without changing button identity or states.

## Timbre visual parity refinement
See docs/FUNCTIONAL_SURFACE_CONTRACT.md for exact surface and transport values. Idle export status and chain heading removed; active export progress/errors remain visible. No audio or timeline semantics changed.

## Readout disclosure rollback — 2026-10-15
User requested removal of the newly introduced Details disclosures across the family. Original always-visible readout panels restored; Oscillator retains its pre-existing Synthesis detail panel and original contents. Value computation and audio behavior unchanged. Do not add disclosure or restructure information during color/minor-UI work. Audio also removes the border above EDIT AUDIO.

Timbre refinement (2026-10-15): waveform and curve use #191C20 with a thin #46515E separator; transport #30343C spans the shell edges. See docs/FUNCTIONAL_SURFACE_CONTRACT.md for precedence.

### Timbre lower-surface exception — 2026-10-15
Explicit user review overrides the shared #30343C transport surround for Timbre: both transport surround and signal-chain background now match waveform/curve paper #191C20. Buttons, meters, separators, layout and processing remain unchanged. This is a Timbre-specific exception, not a family-wide token change.

### User clarification — lower panels, 2026-10-15
Supersedes the immediately preceding dark lower-surface exception: signal chain and transport surrounds use the title surface #373B43. Remove their outer borders/dividers and rounded panel edges; contrast with the #191C20 curve canvas provides grouping. Internal button/meter boundaries remain. The waveform/curve separator from the earlier explicit request remains; this correction concerns the lower panels.

### Shared transport alignment — 2026-10-15 (uncommitted review)
Return / Play / Pause retain their order and behavior. Each occupies a 38 × 32px cell with 4px spacing and a centered 16px icon. Remove the first button's extra 7px offset/divider so visual spacing is uniform. Audio reference palette: surround #292F37, thin border #596472, hover #343A42, playing #5C6978; no per-button accent colors. Override generic button backgrounds only inside transport. Preserve keyboard focus and disabled states.

Release approval (2026-10-15): user approved the reviewed transport/layout changes. All six transport-keyboard suites passed (27 tests total); Oscillator syntax and diff checks passed. Prior browser measurements confirmed equal transport cells, and Oscillator point add/erase, Clear Current, Play/Pause/rewind and narrow layout were checked.

### Transport surface continuity — 2026-10-15 (uncommitted review)
Transport and surrounding page #373B43, no outer border. Fixed transport docks at bottom:0 (no 12px floating gap); bar padding 8px vertically, minimum 56px. At <=1180px all transport containers return to document flow so wrapped controls/meters do not cover editors. Remaining track uses #8290A1; completed portion retains each Lab accent. Audio's canvas track already uses the same remaining color. Transport button capsule remains #292F37 / #596472. This supersedes older #30343C transport surface and mixed footer breakpoints.

### COMMON CANDIDATE — title and identity geometry (2026-10-15)
Audio is the geometry reference: at 900 CSS px and above, mark 38×38 px, title 23 px/1.1, weight 600, tracking −.025em, mark-to-copy gap 10 px. Below 900 px retain Audio’s compact 40×40 px mark and 22 px title with 12 px gap. Center the mark vertically against the brand copy; retain each Lab’s symbol, palette, subtitle, and status content. This does not prescribe identical header heights when content wraps. Shared implementation: `src/brand-layout.css`.
- Browser layout validation: 1280, 768, 600, and 390 CSS px widths; consistent title/mark/gap measurements, no title clipping or document horizontal overflow. Existing SVG assets and audio/interaction JavaScript unchanged.

### COMMON CANDIDATE — channel selector and current-value rhythm
Header output-channel selectors match adjacent file/export controls at 38px height, 13px type, 4px radius. Other synthesis selects retain their own role dimensions. Current-value strips use 8px vertical padding, 14px label line, 4px label-to-value gap and 18px value line (11px/14px font sizes). Preserve existing column counts, wrapping, labels, units, value sources and horizontal rails. Implementation: `src/readout-layout.css`.

### COMMON CANDIDATE — header information rhythm
Use Audio header vertical padding 9px and section gap 12px. At 900px and above hide the descriptive tagline, as Audio already does; below 900px retain it with 12px/1.35 typography. Always retain file/engine status and the local-processing notice, wrapping as needed. Keep existing horizontal rails and control wrapping. Granular engine readout wraps in its own value row instead of clipping; preserve the full Preview/Render counts and dynamic text.
- Checked at 1280/900/768/390 CSS px: header status retained, no horizontal document overflow; Granular engine text remains complete. Separate pre-existing 900px readout truncations remain for Space Preview (Headphones) and Oscillator Safety; not changed in this header pass.

### COMMON CANDIDATE — time and unit notation
Transport clocks use mm:ss.hh, rounded before splitting minutes/seconds (59.999 s → 01:00.00). File-duration metadata uses seconds to two decimals; integer output-duration controls use s / min, preserving one-second steps. Keep millisecond editing precision and existing DSP-parameter precision. Separate numbers from s, ms, Hz, kHz, cents, st, dB/oct and x; keep percent formatting. Granular density uses grains/s and pitch ranges use an en dash. Spectral stretch retains three decimals with x. Compact axis labels may retain abbreviations where space is limited. Display changes do not alter duration, parameter mapping, interpolation, or audio processing.
- Verified clock rollover at 59.999 and 3599.999 s, zero/negative/non-finite fallback, and 10-minute display. Layout checked at 1280/900/390 CSS px. Audio transform-parity test passed; Granular duration control min/max and Audio transport smoke checked. Listening and cross-browser export are not revalidated by this display-only pass.

### COMMON CANDIDATE — compact current-value spacing (2026-10-15, approved)
Below 900 CSS px, current-value strip vertical padding 8→6px, row gap 12→8px, label/value gap 4→2px. Retain label 11px/14px and value 14px/18px typography, existing column counts, wrapping exceptions and all semantic values. No fields hidden, no Details controls introduced. Desktop spacing unchanged.


## Restrained typography — 2026-10-15 local review
COMMON CANDIDATE, Audio-approved visual direction. Shared typography.css gives ordinary text controls/readout values400 weight, section labels500,13px/500 transport time,10px/600 CLIP. Readout labels use natural case and zero tracking. Button dimensions and Lab-specific active/enabled colors remain; decorative highlights removed, active lower bevel1px. Duration14/600 remains intentional. Canvas excessive600/650/750 weights reduced; point tooltip13→12px where applicable; waveform headings natural case. No normalized coordinates, DSP, parameter meanings or transport logic changed.
Commit/deployment withheld for user preview. Native confirmation keyboard and comparative listening remain deferred.

Validation follow-up: default wide layout and narrow354px(Timbre)/390px(other Labs) no horizontal overflow or button clipping; representative active effect/mode colors and400 weight verified, chain enabled colors retained. Basic Play/Pause/rewind confirmed for Timbre/Space/Spectral/Oscillator; Granular no-file disabled state and mode selection checked, no real-file playback repeated. Console errors none; app syntax/diff checks passed. Native zoom not repeated for these five changes. Evidence: shared QA type-family-audit.json and type-family-*-390.png.

## Source-tone waveform — 2026-10-15 (COMMON CANDIDATE, review pending)
- Original input waveform only; effects and tails are not represented by its color. Shared Audio palette: blue → teal → gold → peach, approximate magnitude spectral centroid150–8000Hz on a logarithmic scale. Not pitch, clipping or processed-output analysis.
- Signed16000-bin extrema and physical-pixel envelope retain narrow peaks. Display height uses one shared peak reference across channels, preserving relative stereo levels without the former flattened peaks. Audio samples/gain are unchanged.
- Bounded worker samples at most1024 windows×1024samples×2channels; at most8MiB copied. Long inputs are sampled and short events can be missed. Worker failure falls back to blue; replacement terminates the prior analysis.
- Static waveform is cached across cursor/playback draws, invalidated by source, color result, size and pixel ratio. Mono/stereo lane count and source seeking remain unchanged. No dependency or DSP changes.
- Browser: demo stereo import, Low Pass selection, curve point creation, waveform seek, Play/Pause and actual WAV save passed. Saved10s/stereo/48k/24bit. Native Brave125%/150% checked with900×700 window (720×560 and600×466 CSS viewports); vertical scroll needed at150%, no horizontal overflow, transport accessible.
- Syntax, source-color/immutable extrema, transport parity and keyboard suites passed. File-replacement-export test updated for current import/status contracts; replacement, decode failure, chooser cancellation and retry pass. No listening approval or low-spec certification.
- Preview approved for release; file-replacement test maintenance is test-only.

## Canvas grid contract — 2026-10-18 (local review)
- General decorative grid: 32 CSS px minor, 128 CSS px major, 1 px strokes; density independent of canvas aspect ratio. No snap or change to normalized musical coordinates.
- Semantic value ticks remain parameter-specific; frequency axes preserve existing logarithmic mapping, use shared 1/2/5-per-decade candidates plus endpoints, Hz/kHz units and 24 px minimum label separation.
- Source envelope waits for asynchronous source-color data; no initial legacy blue waveform. On worker failure, neutral gray source shape remains available. No audio samples or processing modified.
- Oscillator partial monitor is retained in source but hidden in the web UI; curve editor reuses freed height.
- Browser verification pending; no commit/deployment or listening approval implied.
- Tick text: 11 px regular, emphasized ticks 11 px medium; point/hover text: 12 px medium. Absolute frequency axes share labels; frequency offsets (e.g. Spectral Shift) retain their signed linear meaning.
- Verified locally: grid/log-label/worker-error tests, source-color tests, keyboard tests, JS syntax; browser initial load and Play/Pause (Granular with 8-second WAV). Independent app tabs reported no console errors. 600 px iframe inspection: all six document widths match their viewport (583 px after scrollbar), minimum curve height about 220 px and transport retained through vertical scrolling. This is not a new native browser zoom or listening certification.

- Release check 2026-10-18: native Brave 125% and 150% reviewed across the family; curve point add/move/Command-delete verified in every Lab. Small viewport checks retained separately. Canvas-grid, source-colors, transport-keyboard and syntax checks passed. Listening/DSP and native confirmation-dialog checks remain separate.

## Shared axis gutter — 2026-10-18
- Curve and source waveform plot starts use canvasAxisWidth = 64 CSS px. Audio fade handle/navigator and source pointer conversion share the same gutter. Normalized curve points, timing and DSP remain unchanged. Absolute frequency axes retain their logarithmic scale.

Verification: 600px layout and actual Brave 125%/150% checked. Pointer add/move/modifier-delete checked across all six labs; Audio source edit lifecycle passed. Oscillator imported 8-second WAV overview aligns with the curve axis. This is UI evidence, not DSP/listening certification.

## Chain insertion gaps — 2026-10-18
Input-after, between-effect and Output-before connector gaps are insertion targets. A contiguous 28px connector hit area covers the whole inter-block gap without uncovered flex gaps or negative margins; a 2px focus-color vertical line indicates insertion. Existing effect colors and keyboard ordering remain unchanged.

Only connector gaps accept insertion. Input/Output terminals and effect blocks do not accept drops; block clicks still select the edited effect.

## Quiet context trial — 2026-10-23
Audio-approved family tokens: resting controls #303740 / #48515c border; hover #404a56 / #7a899b; focus #a9cfff; secondary readout labels #adb6c2; separators #454b54. Background grid draws at 0.65 of its previous opacity. Selected/enabled effect colors, disabled states, font sizes, geometry, parameter scales, points and DSP remain unchanged. COMMON CANDIDATE; user approved family rollout on 2026-10-23.

Verification: Brave wide and 600×700 viewport reviewed (585px client/scroll width, no horizontal overflow); native 150% layout reviewed for all five, 125% additionally reviewed for Timbre. Selected colors retained; playback/stop UI and meters checked (Granular with source-tone-demo.wav). Syntax and diff whitespace checks pass. This is UI evidence, not listening or WAV export acceptance. Family rollout approved for commit/deployment on 2026-10-23.
