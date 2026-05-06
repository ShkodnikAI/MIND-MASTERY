#!/usr/bin/env python3
"""
MIND-MASTERY Audio Generator
============================
Generates binaural beats and ambient music WAV files for the meditation app.

- Binaural beats: stereo WAV, 44100 Hz, 16-bit, 60s, loop-friendly (2s fade in/out)
- Ambient music: stereo WAV, 44100 Hz, 16-bit, 60s, loop-friendly (3s fade in/out)
"""

import os
import sys
import numpy as np
from scipy.io import wavfile

# ── Configuration ──────────────────────────────────────────────────────────────

SAMPLE_RATE = 44100
DURATION = 60  # seconds
SAMPLES = SAMPLE_RATE * DURATION

BINAURAL_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets', 'audio', 'binaural')
MUSIC_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets', 'audio', 'music')

# ── Utility Functions ──────────────────────────────────────────────────────────

def time_array():
    """Return a normalized time array [0, 1) for DURATION seconds."""
    return np.linspace(0, DURATION, SAMPLES, endpoint=False)

def time_samples():
    """Return a sample-index array [0, SAMPLES)."""
    return np.arange(SAMPLES, dtype=np.float64)

def normalize(audio, target_amplitude=0.8):
    """Normalize audio to target amplitude."""
    peak = np.max(np.abs(audio))
    if peak > 0:
        return audio * (target_amplitude / peak)
    return audio

def fade_in_out(audio, fade_samples):
    """Apply linear fade-in and fade-out for seamless looping."""
    fade_in = np.linspace(0.0, 1.0, fade_samples)
    fade_out = np.linspace(1.0, 0.0, fade_samples)
    if audio.ndim == 1:
        audio[:fade_samples] *= fade_in
        audio[-fade_samples:] *= fade_out
    else:
        audio[:fade_samples, 0] *= fade_in
        audio[:fade_samples, 1] *= fade_in
        audio[-fade_samples:, 0] *= fade_out
        audio[-fade_samples:, 1] *= fade_out
    return audio

def to_int16(audio):
    """Convert float audio to 16-bit integer."""
    audio = np.clip(audio, -1.0, 1.0)
    return (audio * 32767).astype(np.int16)

def save_wav(filepath, audio, sr=SAMPLE_RATE):
    """Save audio as WAV file."""
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    wavfile.write(filepath, sr, audio)
    size_kb = os.path.getsize(filepath) / 1024
    print(f"  [OK] {os.path.basename(filepath):30s}  {size_kb:>10.1f} KB")

def generate_noise(seed=42):
    """Generate deterministic white noise."""
    rng = np.random.RandomState(seed)
    return rng.randn(SAMPLES)

def brown_noise(seed=42):
    """Generate brown noise (integrated white noise)."""
    rng = np.random.RandomState(seed)
    white = rng.randn(SAMPLES)
    # Integrate (cumulative sum) for brown noise characteristic
    brown = np.cumsum(white)
    # Normalize
    brown = brown / np.max(np.abs(brown))
    return brown

def lowpass_filter_simple(audio, cutoff_norm):
    """Simple first-order IIR lowpass filter. cutoff_norm in (0, 1), where 1 = Nyquist."""
    alpha = min(cutoff_norm, 0.999)
    filtered = np.zeros_like(audio)
    filtered[0] = audio[0]
    for i in range(1, len(audio)):
        filtered[i] = alpha * filtered[i-1] + (1.0 - alpha) * audio[i]
    return filtered

def bandpass_noise(low_hz, high_hz, seed=42):
    """Generate noise bandpass-filtered between low_hz and high_hz."""
    rng = np.random.RandomState(seed)
    noise = rng.randn(SAMPLES)
    # Use FFT-based filtering
    fft = np.fft.rfft(noise)
    freqs = np.fft.rfftfreq(SAMPLES, 1.0 / SAMPLE_RATE)
    mask = (freqs >= low_hz) & (freqs <= high_hz)
    # Soft edges (10% of bandwidth)
    bw = high_hz - low_hz
    soft = 0.1 * bw
    transition = np.ones(len(freqs))
    for i, f in enumerate(freqs):
        if f < low_hz:
            transition[i] = 0.0
        elif f < low_hz + soft:
            transition[i] = (f - low_hz) / soft
        elif f > high_hz:
            transition[i] = 0.0
        elif f > high_hz - soft:
            transition[i] = (high_hz - f) / soft
        else:
            transition[i] = 1.0
    fft *= transition
    filtered = np.fft.irfft(fft, n=SAMPLES)
    return filtered / np.max(np.abs(filtered))


# ── Binaural Beats Generation ──────────────────────────────────────────────────

def generate_binaural(left_freq, right_freq, amplitude=0.3):
    """
    Generate a binaural beat: soft sine wave with different frequencies in L/R.
    Stereo, 60s, with 2s fade in/out for seamless looping.
    """
    t = time_array()
    left = amplitude * np.sin(2.0 * np.pi * left_freq * t)
    right = amplitude * np.sin(2.0 * np.pi * right_freq * t)
    audio = np.column_stack([left, right])
    audio = fade_in_out(audio, 2 * SAMPLE_RATE)
    return to_int16(audio)


def generate_all_binaural():
    """Generate all 12 binaural beat files."""
    print("\n" + "=" * 60)
    print("  GENERATING BINAURAL BEATS")
    print("=" * 60)

    binaurals = [
        # (filename, left_freq, right_freq)
        ("200hz-10hz.wav", 200, 210),
        ("200hz-8hz.wav",  200, 208),
        ("200hz-6hz.wav",  200, 206),
        ("200hz-4hz.wav",  200, 204),
        ("100hz-10hz.wav", 100, 110),
        ("100hz-8hz.wav",  100, 108),
        ("100hz-6hz.wav",  100, 106),
        ("100hz-4hz.wav",  100, 104),
        ("150hz-10hz.wav", 150, 160),
        ("150hz-8hz.wav",  150, 158),
        ("150hz-6hz.wav",  150, 156),
        ("150hz-4hz.wav",  150, 154),
    ]

    generated = []
    for filename, left_freq, right_freq in binaurals:
        beat_freq = right_freq - left_freq
        wave_type = "Alpha" if beat_freq in (8, 10) else "Theta"
        print(f"\n  {filename}  |  L:{left_freq}Hz R:{right_freq}Hz  |  {beat_freq}Hz {wave_type}")
        audio = generate_binaural(left_freq, right_freq)
        filepath = os.path.join(BINAURAL_DIR, filename)
        save_wav(filepath, audio)
        generated.append(filepath)

    return generated


# ── Ambient Music Generation ───────────────────────────────────────────────────

def generate_space():
    """
    Deep space drone: fundamental 55Hz + harmonics at 110, 165, 220Hz
    with slow amplitude modulation (0.05Hz LFO), ethereal feel.
    """
    print("\n  space.wav  |  Deep space drone: 55Hz + harmonics + 0.05Hz LFO")
    t = time_array()
    amplitude = 0.18

    # Slow amplitude modulation
    lfo = 0.5 + 0.5 * np.sin(2.0 * np.pi * 0.05 * t)

    # Fundamental + harmonics with decreasing amplitude
    signal = (
        1.0  * np.sin(2.0 * np.pi * 55  * t) +
        0.6  * np.sin(2.0 * np.pi * 110 * t) +
        0.35 * np.sin(2.0 * np.pi * 165 * t) +
        0.2  * np.sin(2.0 * np.pi * 220 * t) +
        0.1  * np.sin(2.0 * np.pi * 330 * t)
    )

    signal = amplitude * signal * lfo
    signal = normalize(signal, amplitude)

    # Stereo with slight detune for width
    left = signal
    right = signal * 0.95 + 0.05 * np.sin(2.0 * np.pi * 55.3 * t)
    audio = np.column_stack([left, right])
    audio = fade_in_out(audio, 3 * SAMPLE_RATE)
    return to_int16(audio)


def generate_ocean():
    """
    Ocean waves: brown noise with slow amplitude modulation (0.1Hz cycle)
    simulating the rhythm of waves.
    """
    print("\n  ocean.wav  |  Ocean waves: brown noise + 0.1Hz wave modulation")
    t = time_array()
    amplitude = 0.18

    noise = brown_noise(seed=42)

    # Filter to ocean-like frequency range (focus on lows/mids)
    filtered = bandpass_noise(100, 2000, seed=42)

    # Slow wave modulation: combine two slightly different frequencies for organic feel
    wave1 = 0.5 + 0.5 * np.sin(2.0 * np.pi * 0.1 * t)
    wave2 = 0.5 + 0.5 * np.sin(2.0 * np.pi * 0.13 * t + 1.0)
    modulation = wave1 * 0.7 + wave2 * 0.3

    signal = amplitude * filtered * modulation
    signal = normalize(signal, amplitude)

    # Stereo with subtle variation
    filtered_r = bandpass_noise(120, 2200, seed=137)
    right_signal = amplitude * filtered_r * modulation
    right_signal = normalize(right_signal, amplitude)

    audio = np.column_stack([signal, right_signal])
    audio = fade_in_out(audio, 3 * SAMPLE_RATE)
    return to_int16(audio)


def generate_forest():
    """
    Forest ambience: gentle high-frequency filtered noise with occasional
    bird-like chirps (short sine bursts at 2000-4000Hz).
    """
    print("\n  forest.wav  |  Forest ambience: filtered noise + bird chirps")
    t = time_array()
    amplitude = 0.15

    # Base ambience: soft mid/high noise
    rng = np.random.RandomState(77)
    noise = rng.randn(SAMPLES)
    # Gentle low-pass filter for softness
    alpha_lp = 0.98
    filtered = np.zeros_like(noise)
    filtered[0] = noise[0]
    for i in range(1, len(noise)):
        filtered[i] = alpha_lp * filtered[i-1] + (1.0 - alpha_lp) * noise[i]

    # Add gentle rustle modulation
    rustle = 0.5 + 0.5 * np.sin(2.0 * np.pi * 0.3 * t) * np.sin(2.0 * np.pi * 0.17 * t)

    signal = amplitude * filtered * (0.5 + 0.5 * rustle)
    signal = normalize(signal, amplitude * 0.6)

    # Bird chirps: short sine bursts at various frequencies
    chirp_signal = np.zeros(SAMPLES)
    rng_birds = np.random.RandomState(123)
    num_chirps = 25
    for _ in range(num_chirps):
        start = rng_birds.randint(0, SAMPLES - SAMPLE_RATE // 4)
        freq = rng_birds.uniform(2200, 4000)
        chirp_len = rng_birds.randint(int(SAMPLE_RATE * 0.02), int(SAMPLE_RATE * 0.08))

        # Chirp envelope: attack-decay
        chirp_t = np.arange(chirp_len) / chirp_len
        # Frequency sweep (slight upward)
        freq_sweep = freq + 200 * chirp_t
        chirp_wave = np.sin(2.0 * np.pi * freq_sweep * chirp_t * chirp_len / SAMPLE_RATE)
        # Sharp attack, natural decay
        env = np.exp(-3.0 * chirp_t) * np.minimum(chirp_t * 50, 1.0)

        chirp_vol = rng_birds.uniform(0.08, 0.2)
        end = min(start + chirp_len, SAMPLES)
        chirp_signal[start:end] += chirp_vol * chirp_wave[:end-start] * env[:end-start]

    # Combine
    signal = signal + chirp_signal
    signal = normalize(signal, amplitude)

    # Stereo
    right = signal * 0.97  # Slight difference
    # Move some chirps to right channel
    rng_pan = np.random.RandomState(456)
    for i in range(0, num_chirps, 2):
        start = rng_pan.randint(0, SAMPLES - SAMPLE_RATE // 4)
        end = min(start + int(SAMPLE_RATE * 0.08), SAMPLES)
        right[start:end] *= 1.3

    right = normalize(right, amplitude)
    audio = np.column_stack([signal, right])
    audio = fade_in_out(audio, 3 * SAMPLE_RATE)
    return to_int16(audio)


def generate_fireplace():
    """
    Fireplace crackle: brown noise with gentle crackling modulation,
    warm low frequencies.
    """
    print("\n  fireplace.wav  |  Fireplace crackle: brown noise + crackling")
    t = time_array()
    amplitude = 0.18

    # Base brown noise (warm lows)
    base = brown_noise(seed=55)

    # Filter to warm range
    filtered_base = bandpass_noise(50, 800, seed=55)

    # Crackling: random short bursts
    rng = np.random.RandomState(99)
    crackle = np.zeros(SAMPLES)
    num_crackles = 300
    for _ in range(num_crackles):
        pos = rng.randint(0, SAMPLES - 200)
        length = rng.randint(5, 40)
        vol = rng.uniform(0.01, 0.08)
        # Short noise burst with fast decay
        burst = rng.randn(length) * np.exp(-np.arange(length) / (length * 0.3))
        end = min(pos + length, SAMPLES)
        crackle[pos:end] += vol * burst[:end-pos]

    # Combine: base warmth + crackle
    # Slow warmth modulation (fire flickering)
    warmth_mod = 0.7 + 0.3 * np.sin(2.0 * np.pi * 0.15 * t)
    signal = amplitude * (filtered_base * warmth_mod + crackle)
    signal = normalize(signal, amplitude)

    # Stereo
    filtered_base_r = bandpass_noise(55, 820, seed=155)
    rng_r = np.random.RandomState(199)
    crackle_r = np.zeros(SAMPLES)
    for _ in range(250):
        pos = rng_r.randint(0, SAMPLES - 200)
        length = rng_r.randint(5, 35)
        vol = rng_r.uniform(0.01, 0.07)
        burst = rng_r.randn(length) * np.exp(-np.arange(length) / (length * 0.3))
        end = min(pos + length, SAMPLES)
        crackle_r[pos:end] += vol * burst[:end-pos]
    right_signal = amplitude * (filtered_base_r * warmth_mod + crackle_r)
    right_signal = normalize(right_signal, amplitude)

    audio = np.column_stack([signal, right_signal])
    audio = fade_in_out(audio, 3 * SAMPLE_RATE)
    return to_int16(audio)


def generate_winter():
    """
    Winter/wind: soft white noise with slow sweeping filter,
    cold ethereal feel.
    """
    print("\n  winter.wav  |  Winter wind: filtered noise + sweeping filter")
    t = time_array()
    amplitude = 0.15

    # White noise base
    rng = np.random.RandomState(88)
    noise = rng.randn(SAMPLES)

    # Simple FFT-based filtering with time-varying cutoff
    # Process in chunks for the sweeping effect
    chunk_size = SAMPLE_RATE // 4  # 0.25s chunks
    num_chunks = SAMPLES // chunk_size
    filtered = np.zeros(SAMPLES)

    for i in range(num_chunks):
        start = i * chunk_size
        end = start + chunk_size
        chunk = noise[start:end]

        # Sweeping cutoff: oscillates between 500 and 4000 Hz
        progress = i / num_chunks
        cutoff = 1500 + 1500 * np.sin(2.0 * np.pi * 0.08 * progress * DURATION)
        cutoff_norm = min(cutoff / (SAMPLE_RATE / 2), 0.999)

        # Simple first-order lowpass
        alpha = cutoff_norm
        for j in range(1, len(chunk)):
            chunk[j] = alpha * chunk[j-1] + (1.0 - alpha) * chunk[j]

        filtered[start:end] = chunk

    # Gentle amplitude modulation (wind gusts)
    gust = 0.4 + 0.6 * np.sin(2.0 * np.pi * 0.07 * t) ** 2
    signal = amplitude * filtered * gust
    signal = normalize(signal, amplitude)

    # Add a subtle high ethereal tone
    ethereal = 0.02 * np.sin(2.0 * np.pi * 880 * t) * (0.5 + 0.5 * np.sin(2.0 * np.pi * 0.03 * t))
    signal += ethereal
    signal = normalize(signal, amplitude)

    # Stereo: slightly different filter sweeps
    rng2 = np.random.RandomState(188)
    noise2 = rng2.randn(SAMPLES)
    filtered2 = np.zeros(SAMPLES)
    for i in range(num_chunks):
        start = i * chunk_size
        end = start + chunk_size
        chunk = noise2[start:end]
        progress = i / num_chunks
        cutoff = 1400 + 1400 * np.sin(2.0 * np.pi * 0.08 * progress * DURATION + 0.5)
        cutoff_norm = min(cutoff / (SAMPLE_RATE / 2), 0.999)
        alpha = cutoff_norm
        for j in range(1, len(chunk)):
            chunk[j] = alpha * chunk[j-1] + (1.0 - alpha) * chunk[j]
        filtered2[start:end] = chunk

    right_signal = amplitude * filtered2 * gust
    right_signal += ethereal * 0.9
    right_signal = normalize(right_signal, amplitude)

    audio = np.column_stack([signal, right_signal])
    audio = fade_in_out(audio, 3 * SAMPLE_RATE)
    return to_int16(audio)


def generate_meditation():
    """
    Meditation bowl: 432Hz sine + 864Hz harmonic + slow decay/repeat pattern,
    singing bowl feel.
    """
    print("\n  meditation.wav  |  Singing bowl: 432Hz + 864Hz + decay/repeat")
    t = time_array()
    amplitude = 0.2

    signal = np.zeros(SAMPLES)

    # Singing bowl parameters
    fundamental = 432.0
    harmonic = 864.0
    overtone = 1296.0

    # Bowl strike pattern: strike every ~8 seconds with slow decay
    strike_interval = 8.0  # seconds
    decay_time = 6.0  # seconds for the sound to decay

    num_strikes = int(DURATION / strike_interval) + 1
    for s in range(num_strikes):
        strike_start = int(s * strike_interval * SAMPLE_RATE)
        if strike_start >= SAMPLES:
            break

        remaining = SAMPLES - strike_start
        local_t = np.arange(remaining, dtype=np.float64) / SAMPLE_RATE

        # Exponential decay envelope
        env = np.exp(-local_t / decay_time)

        # Bowl sound: fundamental + harmonics with slight beating
        bowl = (
            1.0  * np.sin(2.0 * np.pi * fundamental * local_t) +
            0.5  * np.sin(2.0 * np.pi * harmonic * local_t) +
            0.2  * np.sin(2.0 * np.pi * overtone * local_t) +
            0.15 * np.sin(2.0 * np.pi * (fundamental * 2.005) * local_t) +  # slight detune for beating
            0.1  * np.sin(2.0 * np.pi * (harmonic * 1.003) * local_t)
        )

        # Sharp attack, exponential decay (like a real bowl strike)
        attack = np.minimum(local_t * 200, 1.0)  # ~5ms attack
        bowl_envelope = bowl * env * attack

        end = min(strike_start + remaining, SAMPLES)
        signal[strike_start:end] += bowl_envelope[:end - strike_start]

    signal = normalize(signal, amplitude)

    # Subtle continuous drone underneath
    drone = 0.03 * np.sin(2.0 * np.pi * 216 * t)  # sub-octave
    signal += drone
    signal = normalize(signal, amplitude)

    # Stereo with slight phase offset for spaciousness
    left = signal
    right = np.roll(signal, 15)  # Tiny delay for width
    audio = np.column_stack([left, right])
    audio = fade_in_out(audio, 3 * SAMPLE_RATE)
    return to_int16(audio)


def generate_all_music():
    """Generate all 6 ambient music files."""
    print("\n" + "=" * 60)
    print("  GENERATING AMBIENT MUSIC")
    print("=" * 60)

    generators = [
        ("space.wav",       generate_space),
        ("ocean.wav",       generate_ocean),
        ("forest.wav",      generate_forest),
        ("fireplace.wav",   generate_fireplace),
        ("winter.wav",      generate_winter),
        ("meditation.wav",  generate_meditation),
    ]

    generated = []
    for filename, gen_func in generators:
        audio = gen_func()
        filepath = os.path.join(MUSIC_DIR, filename)
        save_wav(filepath, audio)
        generated.append(filepath)

    return generated


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("  MIND-MASTERY Audio Generator")
    print("  Format: WAV, 44100 Hz, 16-bit, 60 seconds")
    print("=" * 60)

    # Ensure directories exist
    os.makedirs(BINAURAL_DIR, exist_ok=True)
    os.makedirs(MUSIC_DIR, exist_ok=True)

    # Generate all audio
    binaural_files = generate_all_binaural()
    music_files = generate_all_music()

    # Summary
    print("\n" + "=" * 60)
    print("  GENERATION COMPLETE")
    print("=" * 60)
    print(f"\n  Binaural beats: {len(binaural_files)} files")
    print(f"  Ambient music:  {len(music_files)} files")
    print(f"  Total files:    {len(binaural_files) + len(music_files)}")
    print()

    # File listing with sizes
    all_files = binaural_files + music_files
    all_files.sort()
    print(f"  {'File':<50s}  {'Size':>10s}")
    print(f"  {'─' * 50}  {'─' * 10}")
    total_size = 0
    for f in all_files:
        size = os.path.getsize(f)
        total_size += size
        rel_path = os.path.relpath(f, os.path.join(os.path.dirname(__file__), '..'))
        print(f"  {rel_path:<50s}  {size / 1024:>8.1f} KB")

    print(f"\n  Total size: {total_size / (1024 * 1024):.2f} MB")
    print()

    # Verify all files
    missing = []
    expected_binaural = [
        "200hz-10hz.wav", "200hz-8hz.wav", "200hz-6hz.wav", "200hz-4hz.wav",
        "100hz-10hz.wav", "100hz-8hz.wav", "100hz-6hz.wav", "100hz-4hz.wav",
        "150hz-10hz.wav", "150hz-8hz.wav", "150hz-6hz.wav", "150hz-4hz.wav",
    ]
    expected_music = [
        "space.wav", "ocean.wav", "forest.wav", "fireplace.wav",
        "winter.wav", "meditation.wav",
    ]

    for name in expected_binaural:
        path = os.path.join(BINAURAL_DIR, name)
        if not os.path.exists(path):
            missing.append(path)

    for name in expected_music:
        path = os.path.join(MUSIC_DIR, name)
        if not os.path.exists(path):
            missing.append(path)

    if missing:
        print("  [WARNING] Missing files:")
        for m in missing:
            print(f"    {m}")
        return 1
    else:
        print("  All files generated successfully!")
        return 0


if __name__ == "__main__":
    sys.exit(main())
