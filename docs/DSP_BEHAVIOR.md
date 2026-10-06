# DSP Behavior

## Musical Overview

Timbre Curve Lab treats filter and delay parameters as trajectories through time. A sound passes through the enabled modules from left to right in the Signal Chain. Low/High/Band filters sculpt spectral regions; Comb creates pitched short-delay color; Flanger and Chorus move short delays with LFOs; Delay creates separate echoes.

## Signal Flow

```text
Decoded source or generated sample
  -> enabled effects in user-defined chain order
  -> output gain 0.95
  -> soft safety limiter
  -> realtime stereo output

Offline Render uses the same conceptual path
  -> optional Delay tail
  -> downward-only peak normalization if peak exceeds 0.98
  -> stereo 24-bit PCM WAV
```

All effects start bypassed. Bypassed modules do not color the signal.

## Curve Evaluation

At each output time, source-relative normalized time selects the two surrounding points. The value uses smoothstep interpolation:

`s(t) = t^2(3 - 2t)`

`value = a + (b - a)s(t)`

This eases into and out of points. Preview evaluates it for every AudioContext output sample; Render evaluates it for every source-rate output sample. The two engines currently duplicate this formula.

Coincident or nearly coincident point times use a minimum denominator of `1e-6`. The resulting very fast transition is implemented behavior, but its preferred editing policy and listening limits are not yet formally decided.

## Filter Algorithms

Low Pass, High Pass, and Band Pass use a topology-preserving-transform state-variable filter. Cutoff/center is clamped to `10 Hz .. 0.45 x sampleRate` inside the DSP, while the user mapping starts at 40 Hz and tops out at `min(18 kHz, 0.45 x sampleRate)`.

- Low Pass output: low state, fixed Q 0.71.
- High Pass output: high state, fixed Q 0.71.
- Band Pass output: band state, Q controlled by Width.
- Band Width `>= 0.995`: full-band bypass instead of a very broad colored filter.

There is no additional filter-coefficient smoothing. Smoothstep curve interpolation reduces point corners, but rapid dense curves can still update cutoff quickly. Audible zipper/click risk is `TO BE VERIFIED` through formal listening.

## Comb

- Fractional delay with linear interpolation between delay-buffer samples.
- Delay Time: 0.5-100 ms logarithmic.
- Delay state approaches its target by coefficient 0.0025 per sample.
- Feedback is clamped to 0-0.95.
- Feedback path includes a one-pole damping update coefficient of 0.22.
- The combed signal is `(input + delayed) * 0.5`, then blended by Mix.
- Current buffer length is 120 ms at the active sample rate.
- Feedback-buffer writes are clamped to +/-1.5 before the final limiter.

## Flanger

- Fractional delay with sine LFO.
- Base delay 0.5-10 ms, depth 0-10 ms, rate 0.02-5 Hz.
- Base delay smoothing coefficient 0.0015 per sample.
- Feedback clamp 0-0.85 with damping coefficient 0.35.
- Output balance is fixed at 46% input and 54% delayed.
- Feedback-buffer writes are clamped to +/-1.35 before the final limiter.
- Right-channel LFO starts one quarter cycle after the left channel.

## Chorus

- Fractional delay with sine LFO.
- Base delay 10-35 ms, depth 0-20 ms, rate 0.02-3 Hz.
- Base delay smoothing coefficient 0.0015 per sample.
- Output uses the user Mix control.
- Right-channel LFO starts half a cycle after the left channel.

## Delay

- Fractional delay with linear interpolation.
- Delay Time 100-1500 ms, Feedback 0-0.85, Mix 0-100%.
- Delay Time smoothing coefficient 0.0008 per sample.
- Feedback path damping coefficient 0.22.
- Feedback-buffer writes are clamped to +/-1.25 before the final limiter.
- Render tail is estimated from maximum Delay Time and Feedback curves until approximately -60 dB (`0.001`), capped at 10 seconds.

## Safety And Gain

Both engines apply output gain 0.95, then the same soft limiter:

- input clamp -> +/-2,
- threshold -> 0.92,
- nonlinear compression above threshold,
- output clamp -> +/-0.995.

The current limiter does not explicitly replace `NaN` or `Infinity` with zero. The arithmetic clamps contain finite extreme values, but non-finite defense is not implemented and must not be claimed as verified behavior.

Offline Render additionally scales the completed output downward only if measured peak exceeds 0.98. Preview does not perform this completed-buffer normalization. Therefore exact amplitudes can differ when the offline peak triggers this final scale.

## Channels And Sample Rate

- Preview output is stereo.
- Mono input is duplicated to both channels.
- Stereo input uses channels 1 and 2.
- Input channels above two are discarded.
- Offline output is always stereo.
- DSP retains the decoded input sample rate; completed output is band-limited and resampled to 48 kHz before WAV encoding.
- The generated default sample uses the current AudioContext sample rate, commonly 48 kHz but not guaranteed by the product specification.

## Preview Output Measurement

The realtime path is `Timbre AudioWorklet -> stereo output analyser -> AudioContext destination`. The analyser reads the final post-limiter L/R signal and does not feed any values back into DSP, alter gain, or participate in Offline Render. It reports RMS, instantaneous peak, peak hold, and a latched clip state at `>= 0.999` linear amplitude.

## WAV Format

Current encoder:

- RIFF/WAVE
- `fmt` size 16
- PCM format code 1
- 2 channels
- signed 24-bit little-endian
- 6-byte block align
- byte rate `sampleRate * 6`
- interleaved left/right samples

Each channel sample occupies three bytes and maps `-1.0 .. +1.0` to `-8388608 .. 8388607`. Export is fixed at 48 kHz. `wav-output.js` converts the completed stereo signal, including Delay tail; it never relabels unconverted PCM. 48 kHz output bypasses conversion unchanged.

## Preview And Render Parity

| Behavior | Preview | Render | Risk |
|---|---|---|---|
| Parameter mappings | Duplicated in worklet | Duplicated offline | Medium maintenance drift risk |
| Curve interpolation | Smoothstep | Smoothstep | Low currently |
| Filter algorithm | Same SVF equations | Same SVF equations | Low currently |
| Delay smoothing | Same coefficients | Same coefficients | Low currently |
| Chain order | User order | User order | Low |
| Gain/limiter | 0.95 + soft limiter | Same | Low |
| Final normalization | None | Downward if peak > 0.98 | Audible level difference possible |
| Delay tail | Plays after source until estimated end | Rendered with same estimate | Low, lifecycle should be retested |
| Source-rate conversion | Source is read at `sourceRate / AudioContextRate` with linear interpolation | No source conversion; samples are processed at source rate | Medium/high for unlike rates; high-frequency response can differ |
| Cutoff mapping sample rate | Uses AudioContext sample rate | Uses decoded source sample rate | Medium; maximum cutoff can differ for low-rate sources |
| Source boundary | Stops linear reads three source frames before the buffer end | Processes the complete capped source length | Very low duration difference; boundary transient requires verification |
| Channel layout | Stereo | Stereo | Low |
| LFO start/reset | Full transport/filter reset restores Flanger 0/0.25 and Chorus 0/0.5 phases | Fresh deterministic 0/0.25 and 0/0.5 phases per render | Transport reset deterministic in current tested cases; effect bypass/re-enable and whole-tail parity remain separate |
| Initial delay target | 8 ms Comb, 3 ms Flanger, 18 ms Chorus, 350 ms Delay, then smoothing | Same initial values | Low parity risk, but startup color differs from current UI defaults |

The duplicate calculation code is a known structural risk. AudioWorklet module isolation explains separate files but does not remove the need for synchronized tests or a future shared pure-DSP module.

The UI frequency axis is fixed at 40 Hz-18 kHz. Preview clamps its mapping against the AudioContext Nyquist region; Render clamps against the source sample rate. At common 44.1/48 kHz rates both usually reach 18 kHz, but a 22.05 kHz source can render with a much lower maximum than the UI or Preview suggests.

## Initialization And Reset

Filter integrator states, delay buffers, and delay targets are reset when buffers/state require it or effects leave the active chain. Transport uses tokens to reject stale stop/end messages. Full reset now explicitly sets left Flanger/Chorus phase to zero and retains right 0.25/0.5 offsets. Previously left phases could survive this reset; that asymmetry was reproduced and fixed.

Only the Delay module determines the explicit post-source tail duration. Comb and Flanger feedback do not independently extend playback. If Delay is active, the entire chain continues processing zeros during the calculated Delay tail.

## Default Reference Source

The built-in source is eight seconds of identical left/right white noise in repeated percussive intervals:

- noise burst 45.833 ms,
- silent gap 20.833 ms,
- attack 3 ms,
- decay 14 ms,
- sustain level 0.22,
- release 18 ms,
- noise gain 0.32.

Noise values use unseeded `Math.random()`. Each page initialization therefore creates a different waveform. Preview and Render share the same generated buffer within one session, but separate sessions are not sample-identical. Use the committed/future fixed fixtures in `REFERENCE_SOUND_SET.md` for reproducible comparison rather than treating a newly generated default sample as a measurement reference.

## Known Limitations

- Formal cross-browser listening comparison is not documented.
- Fast filter automation has no explicit cutoff smoothing.
- Render is JavaScript on the main thread with periodic yields and can be expensive for long files.
- Multichannel layouts are not preserved.
- Preview and Render share a specification but not one source module.
- No deterministic automated audio-regression fixture is currently stored in the repository.
- Unlike-rate Preview uses simple linear source interpolation without a dedicated anti-aliasing resampler.
- Full transport reset is now deterministic in the transport regression fixture; bypass/re-enable and full-tail parity remain to be verified.

## Fixed WAV Conversion — 2026-10-06

The family converter uses a centered 96-tap DC-normalized Blackman-windowed sinc,
cutoff 0.94 times the lower Nyquist frequency, exact rational phases for common rates
(up to 1024 phases), endpoint extension, and rounded output frame count. Its centered
kernel adds no file delay. It yields/checks cancellation every 8192 frames.

Conversion occurs after the existing sample-rate DSP, tail processing and peak
normalization. Preview, LFO state/reset policy, feedback, filters, effect order,
smoothing, the 180-second source cap and 10-second Delay-tail cap are unchanged.
The converter matches Audio's implementation at commit a552b5e; this is a shared
candidate with a versioned local copy, not an external runtime dependency.

Numerical evidence: 11 browser checks passed (four 60-second rates, four Delay-tail
cases, 30 kHz rejection, stereo separation, cancellation). Eighteen before/after
cases cover bypass, each effect and the full chain at 48/96k; all 48k WAVs are
byte-identical to the previous renderer. Actual 6-second 96k WAV + default Delay
saved and reopened as 48k/24-bit stereo, 10.2 seconds (6 + 4.2 tail).
Listening approval and long-file/cross-browser coverage remain unverified.

## 2026-10-06 — Reject over-limit export instead of truncating (local, unpublished)

Previously the renderer silently limited the body to 180 seconds and reported capped after downloading. It now raises EXPORT_DURATION_LIMIT before output allocation; the app states that no file was saved and restores the controls. Audio checks estimated output duration after Speed; Timbre checks source duration and preserves the existing Delay tail for accepted files. Exactly 180 seconds remains supported. This is an interim explicit limit, not full long-file support. Preview and DSP inside the supported range are unchanged. Long-file memory/cancellation and full-duration policy remain open.

Validation: actual 180-second render accepted, 181/540 seconds rejected, and Audio 120-second input at Speed 0.5 rejected for its 240-second output. Browser 181-second file produced the explicit message with no console errors.

### Export recovery follow-up — 2026-10-06

Already-aborted or over-limit renders exit before accessing source PCM channels or allocating output arrays. Five cancel/re-render cycles reproduce the same clean WAV. Browser checks with a 180-second file confirm Cancel returns controls; loading a new 6-second file then exports stereo 48k/24-bit/6 seconds. No console warnings/errors observed. Audio labels its existing capped playback timeline “preview limit”; this does not extend playback or export support. Long-file heap/GC behavior and low-memory device testing are still unverified.

### Release boundary verification

Ten 180-second synthetic-render cancellations with explicit Node GC left no additional ArrayBuffer bytes after collection. This is not browser/device memory certification. Audio accepts a 240-second source when 2x Speed produces 120 seconds; Timbre accepts a 180-second source plus its 100ms test Delay tail. Supported-range DSP and Preview remain unchanged.


## Cancellable WAV encoding — 2026-10-06

Encoding moved to src/wav-encoder.js. PCM quantization, clamping, channel interleave, header bytes and sample count match the frozen legacy encoder. Each block is snapshotted into a Blob part; a final Blob joins the parts. Source-rate DSP, resampling, gain, curves, Preview and duration limits remain unchanged. PCM input/output arrays are still retained; this is not streaming DSP or full long-file support.

Validation: tests/wav-encoder.mjs and tests/browser-wav-encoder.html cover legacy byte parity across block boundaries, pre-abort, final-block abort, and cancel/recovery. Existing WAV, limit and recovery regressions pass; Audio transform parity also passes. Local app default 8-second export saved a 48k/24-bit WAV. Listening, Safari and low-memory device verification remain open.


## Block-fed WAV conversion — 2026-10-06

COMMON CANDIDATE: browser Download WAV requests includePCM:false. After unchanged source-rate DSP, the existing 96-tap conversion sends synchronous Float32 blocks to the PCM24 writer. Global frame indices, filter phase and Float32 rounding remain unchanged. The sink snapshots each block before it is reused. No full converted stereo PCM arrays are allocated for this path. At 48 kHz the sink consumes views of the existing source-rate output. Returned data contains Blob, frameCount, sampleRate, duration and truncated, not left/right. The default includePCM:true preserves the diagnostic PCM-returning API.

Cancellation is checked through conversion, append and finalization, including after the final block yield. The writer rejects incomplete output. Source-rate output and Blob payload still occupy memory; this is not streaming the DSP itself. The 180-second policy and Preview stay unchanged. Native migration should preserve this file contract without requiring the web Blob implementation.

Validation: frozen pre-change conversion/PCM24 oracle, 32 cases per Lab across 32/44.1/48/88.2/96 kHz, block edges, cancellation/recovery and renderer parity (Timbre Delay tail included). Existing regression suites pass. Nine-minute stereo 96k QA-only profiles preserve WAV duration and marker regions; Node memory measurements do not certify browser/low-memory behavior or listening quality.


## Deterministic transport LFO reset — 2026-10-06

Full reset explicitly restores left Flanger/Chorus phase to 0; right offsets remain 0.25/0.5. This affects Stop(reset), seek, buffer replacement and natural-end restart paths that call resetFilter. Pausing without reset and bypass/re-enable policy are not changed. It fixes history-dependent Preview restarts without changing fresh Render, modulation ranges or tone tuning. Seek starts cleared state at the destination; it does not reconstruct the effect history from the start of the file.

Validation: tests/transport-parity.mjs executes the actual Worklet class in a Node mock at 48k, 128-frame blocks. Ten effect orders compare left-channel first-half PCM for repeated Stop/Play, used-vs-fresh seek, and initial Preview versus Render. All tested differences are zero after the fix. Real browser Flanger+Chorus play, seek, Stop and replay passed with no console warnings/errors. Right-channel full numerical parity, natural-end replay, full tails, high feedback and cross-rate Preview comparisons remain separate verification targets.


### Final transport and endpoint verification — 2026-10-06

Preview now uses the full source frame count for end/replay/seek bounds. Linear reading holds the final sample for fractional positions in the last frame and returns zero beyond the buffer. Previously Preview stopped three frames early; this truncated the last effect samples and ended tails early. Render processing is unchanged.

transport-tail.mjs adds 13 stereo cases including individual modulation effects, Delay at normalized feedback 0 and 1 (actual 0/0.85), Chorus/Delay in both orders, and full/reversed chains. At 48k with a low-level 0.25-second fixture ending in nonzero PCM: full Preview/Render output including tail matches exactly, Stop/Play and seek history checks pass for both channels, one ended event is emitted, post-end output is silent, and natural replay reproduces initial PCM. This supersedes the earlier pending status for these specific cases. Extreme gain, other rates, all curve shapes and listening remain outside this claim.


## Active-playback bypass LFO reset — 2026-10-06 (local, unpublished)

resetInactiveStates now restores left Flanger/Chorus phase to zero alongside existing right offsets 0.25/0.5 when inactive effects are processed during playback. Previously left phases survived while the right reset. Two explicit assignments fix that asymmetry; no effect ranges, offline DSP, transport reset or tail policies change.

rate-toggle.mjs verifies 24 source/context-rate transport cases (44.1/48/88.2/96k input, 44.1/48k context, bypass/Flanger/Chorus): finite stereo output, restart/seek/natural-replay consistency and endpoint within one context frame. Four same-rate bypass/re-enable cases reproduce clean-reference stereo PCM exactly. This does not assert cross-rate Preview/Render tonal equivalence. Inactive processing must occur between OFF and ON; pause-time or same-quantum rapid toggles are not covered by this fix. Browser playback OFF/ON control and chain state also checked.


## Immediate inactive-state cleanup — 2026-10-06 (local, unpublished)

Settings messages now call resetInactiveStates(orderedEffects()) immediately after the existing Comb deactivation cleanup. Disabled filters/delays no longer depend on a future process frame to clear state. Active effects retain state, including across pause and unrelated settings. This covers engine-level pause and OFF/ON messages arriving before any process call. The public UI currently exposes Play/Stop, not pause; do not present the engine pause test as a UI feature.

paused-toggle.mjs checks seven effects in active/paused conditions (14 cases), using 0.5 seconds of history and comparing stereo re-enable output to a cleared-state reference at the same position. It also checks that pause/resume with unchanged enabled effects preserves continuous PCM. Prior active-bypass, transport/tail, WAV and limit regressions remain applicable. No new effect or tone parameter change.

## 2026-10-06: Chain state and gain boundary verification

`tests/chain-gain.mjs` passes six reorder cases (three chains, playing/internal pause): reversing then restoring order before processing preserves the next 4096 stereo frames exactly. Processing reversed orders remains finite. Six 48k dry-tone amplitude cases confirm Preview/Render equality below final normalization and the documented Render-only scale above it (peak 0.995 to 0.98, -0.13194 dB; scale-adjusted error < 3.2e-8). No gain/limiter policy was changed. These are engine measurements, not reorder-click listening, all-permutation coverage, or device performance certification. The local bypass/reset fix is ready for a scoped commit and deployment; neither was performed in this step.
