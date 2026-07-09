# Analog Circuit Simulator

A browser-based interactive simulator for analog op-amp circuits, built with HTML, CSS, and JavaScript. Designed to bridge the gap between textbook theory and real-world circuit behaviour by simulating both ideal and non-ideal op-amp characteristics using real Texas Instruments chip datasheet values.

**Live demo:** https://geethika-2807.github.io/Analog-circuit-simulator/

---

## What it does

This simulator lets you select an analog circuit, enter component values, choose an op-amp model, and instantly see:

- **Ideal output voltage** — what the circuit produces in theory
- **Real output voltage** — what a physical chip actually produces, accounting for non-idealities
- **Error breakdown** — offset voltage error, bias current error, GBW gain loss, slew rate distortion
- **Live waveform** — input, ideal output, and real output drawn simultaneously on a canvas oscilloscope

It also includes a **Design Mode** that works in reverse — you specify what you need (target gain, bandwidth, amplitude) and the simulator recommends the right resistor values and the best op-amp chip for your requirements.

---

## Features

### Analysis Mode
- **6 circuit topologies:**
  - Inverting amplifier
  - Non-inverting amplifier
  - Voltage follower
  - Summing amplifier (2–4 inputs)
  - Integrator
  - Differentiator

- **6 real TI op-amp chip models** with actual datasheet values:
  - LM741 — classic general purpose
  - LM358 — dual, single supply
  - TL071 — JFET input, low noise
  - OPA2134 — high precision audio
  - OPA277 — ultra precision industrial
  - LMV321 — low voltage, low power IoT

- **Non-ideality simulation:**
  - Offset voltage error (amplified by gain)
  - Input bias current error (through feedback resistor)
  - Gain-Bandwidth Product (GBW) attenuation at frequency
  - Slew rate limiting and distortion detection
  - Saturation clamping to supply voltage

- **Live waveform canvas:**
  - Sine, square, and triangle input waveforms
  - Three simultaneous lines: input (blue), ideal output (green), real output (orange)
  - Auto-scaling axes with voltage and time labels
  - Auto time unit switching (ms / μs) based on frequency
  - Waveform updates automatically when op-amp model or waveform type is changed

### Design Mode
Specification-driven design — tell the tool what you need, it finds the solution:

- **Fixed voltage gain** — enter target gain, phase requirement, bandwidth, amplitude; get recommended Rin/Rf snapped to E12 standard resistor series with actual gain error
- **Buffer/isolation** — get voltage follower recommendation with chip verification
- **Integration/Differentiation** — enter frequency and amplitude requirements; get capacitor and resistor values
- **Summing/Mixing** — enter per-input gains; get individual resistor values

For every design, the tool verifies all 6 chips against your specifications and recommends the best one, showing pass/warning/fail status with specific failure reasons.

### Help Panel
Built-in reference panel covering:
- Step-by-step usage guide for both modes
- Circuit type explanations with formulas
- Non-ideality concepts in plain English
- Op-amp chip comparison table
- Design mode walkthrough

---

## Technical details

**Stack:** Vanilla HTML, CSS, JavaScript — no frameworks, no libraries, no build tools

**File structure:**
```
analog-circuit-simulator/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   ├── nonidealities.js
│   ├── designMode.js
│   └── circuits/
│       ├── inverting.js
│       ├── noninverting.js
│       ├── voltageFollower.js
│       ├── summingAmp.js
│       ├── integrator.js
│       └── differentiator.js
└── assets/
```

**Circuit math:**
- Inverting: Vout = −(Rf/Rin) × Vin
- Non-inverting: Vout = (1 + Rf/Rin) × Vin
- Integrator: |Vout| = Vin / (2π × f × Rin × C)
- Differentiator: |Vout| = 2π × f × Rf × C × Vin
- All outputs clamped to supply voltage (saturation)

**Non-ideality models:**
- Offset voltage: Verror = Vos × |gain|
- Bias current: Verror = Ib × Rf
- GBW: actual_gain = gain / √(1 + (f/BW)²) where BW = GBW/|gain|
- Slew rate: checked against 2π × f × |Vout_peak|

**E12 resistor snapping:** Design mode calculates exact component values then finds the nearest value in the standard E12 series (1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2 × decade)

---

## Why I built this

Most analog circuit simulators (LTSpice, Falstad) require drawing schematics before seeing results. This tool skips the schematic and goes straight to the numbers and waveform — making it faster for learning and quick verification.

The non-ideality comparison is the core feature. Real engineering decisions (which op-amp to choose, why LM741 fails at high frequency, what slew rate distortion looks like) are hard to visualise in textbooks. This simulator makes those effects immediately visible.

The Design Mode reflects real engineering workflow — specifications first, components second, chip selection last.

---

## Chip datasheet values used

| Chip | GBW | Slew Rate | Vos | Ib |
|------|-----|-----------|-----|----|
| LM741 | 1 MHz | 0.5 V/μs | 2 mV | 80 nA |
| LM358 | 0.7 MHz | 0.3 V/μs | 3 mV | 45 nA |
| TL071 | 3 MHz | 13 V/μs | 3 mV | 30 pA |
| OPA2134 | 8 MHz | 20 V/μs | 0.5 mV | 5 pA |
| OPA277 | 1 MHz | 0.8 V/μs | 0.02 mV | 1 nA |
| LMV321 | 1 MHz | 1 V/μs | 7 mV | 100 pA |

Values sourced from Texas Instruments datasheets.

---

## Planned future work

- MOSFET circuit topologies (common source, gate, drain)
- Active filter circuits (low-pass, high-pass, band-pass Butterworth)
- Current mirror circuits (basic, cascode, Wilson)
- Bode plot frequency response visualization
- CSV export of waveform data
- Dark mode

---

## Author

Geethika — B.Tech Electrical Engineering, IIT Palakkad
