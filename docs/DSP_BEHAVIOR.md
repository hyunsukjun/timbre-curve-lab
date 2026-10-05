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
| LFO start/reset | Stateful Worklet phases; right phase is assigned 0.25/0.5 on reset while the left phase is not always forced to zero | Fresh deterministic 0/0.25 and 0/0.5 phases per render | Medium; repeated Preview may start at a different sweep position |
| Initial delay target | 8 ms Comb, 3 ms Flanger, 18 ms Chorus, 350 ms Delay, then smoothing | Same initial values | Low parity risk, but startup color differs from current UI defaults |

The duplicate calculation code is a known structural risk. AudioWorklet module isolation explains separate files but does not remove the need for synchronized tests or a future shared pure-DSP module.

The UI frequency axis is fixed at 40 Hz-18 kHz. Preview clamps its mapping against the AudioContext Nyquist region; Render clamps against the source sample rate. At common 44.1/48 kHz rates both usually reach 18 kHz, but a 22.05 kHz source can render with a much lower maximum than the UI or Preview suggests.

## Initialization And Reset

Filter integrator states, delay buffers, and delay targets are reset when buffers/state require it or effects leave the active chain. Transport uses tokens to reject stale stop/end messages. Current LFO reset behavior is asymmetric: the right Flanger/Chorus phase is assigned 0.25/0.5, while an existing left phase is not always forced back to zero. This is current web behavior, not a recommended standalone contract.

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
- LFO reset/start behavior is not fully deterministic across repeated Preview operations.

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
