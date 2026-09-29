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

This eases into and out of points. Preview and Render currently duplicate this formula.

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

## Flanger

- Fractional delay with sine LFO.
- Base delay 0.5-10 ms, depth 0-10 ms, rate 0.02-5 Hz.
- Base delay smoothing coefficient 0.0015 per sample.
- Feedback clamp 0-0.85 with damping coefficient 0.35.
- Output balance is fixed at 46% input and 54% delayed.
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
- Render tail is estimated from maximum Delay Time and Feedback curves until approximately -60 dB (`0.001`), capped at 10 seconds.

## Safety And Gain

Both engines apply output gain 0.95, then the same soft limiter:

- non-finite sample -> 0,
- input clamp -> +/-2,
- threshold -> 0.92,
- nonlinear compression above threshold,
- output clamp -> +/-0.995.

Offline Render additionally scales the completed output downward only if measured peak exceeds 0.98. Preview does not perform this completed-buffer normalization. Therefore exact amplitudes can differ when the offline peak triggers this final scale.

## Channels And Sample Rate

- Preview output is stereo.
- Mono input is duplicated to both channels.
- Stereo input uses channels 1 and 2.
- Input channels above two are discarded.
- Offline output is always stereo.
- Export retains the decoded input sample rate.
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

Each channel sample occupies three bytes and maps `-1.0 .. +1.0` to `-8388608 .. 8388607`. Export preserves the decoded source sample rate; it does not relabel or resample every source to 48 kHz.

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
| Sample rate | AudioContext output with source-rate position conversion | Source sample rate | Browser resampling can differ |
| Channel layout | Stereo | Stereo | Low |

The duplicate calculation code is a known structural risk. AudioWorklet module isolation explains separate files but does not remove the need for synchronized tests or a future shared pure-DSP module.

## Initialization And Reset

Filter integrator states, delay buffers, LFO phases, and delay targets are reset when buffers/state require it or effects leave the active chain. Stereo LFO phase offsets are restored. Transport uses tokens to reject stale stop/end messages.

## Known Limitations

- Formal cross-browser listening comparison is not documented.
- Fast filter automation has no explicit cutoff smoothing.
- Render is JavaScript on the main thread with periodic yields and can be expensive for long files.
- Multichannel layouts are not preserved.
- Preview and Render share a specification but not one source module.
- No deterministic automated audio-regression fixture is currently stored in the repository.
