var chipData = {
    ideal: {
        name: "Ideal",
        vos: 0,
        ib: 0,
        gbw: Infinity,
        slew: Infinity,
        cmrr: Infinity,
        psrr: Infinity,
        description: "Perfect op-amp with no real-world limitations"
    },
    lm741: {
        name: "LM741",
        vos: 0.002,
        ib: 80e-9,
        gbw: 1e6,
        slew: 0.5e6,
        cmrr: 90,
        psrr: 96,
        description: "Classic general purpose op-amp, slow but widely used"
    },
    lm358: {
        name: "LM358",
        vos: 0.003,
        ib: 45e-9,
        gbw: 0.7e6,
        slew: 0.3e6,
        cmrr: 85,
        psrr: 100,
        description: "Dual op-amp, single supply, very common in industry"
    },
    tl071: {
        name: "TL071",
        vos: 0.003,
        ib: 30e-12,
        gbw: 3e6,
        slew: 13e6,
        cmrr: 100,
        psrr: 100,
        description: "JFET input, low noise, used in audio and instrumentation"
    },
    opa2134: {
        name: "OPA2134",
        vos: 0.0005,
        ib: 5e-12,
        gbw: 8e6,
        slew: 20e6,
        cmrr: 100,
        psrr: 100,
        description: "High precision audio op-amp, very low distortion"
    },
    opa277: {
        name: "OPA277",
        vos: 0.00002,
        ib: 1e-9,
        gbw: 1e6,
        slew: 0.8e6,
        cmrr: 140,
        psrr: 120,
        description: "Ultra precision, very low offset, used in industrial sensors"
    },
    lmv321: {
        name: "LMV321",
        vos: 0.007,
        ib: 100e-12,
        gbw: 1e6,
        slew: 1e6,
        cmrr: 70,
        psrr: 77,
        description: "Low voltage, low power, rail-to-rail, used in IoT devices"
    }
};

function applyNonidealities(idealVout, chip, gain, vin, rf, freq, vs)  {
    var c = chipData[chip];
    var errors = {};

    // offset voltage error
    var vosError = c.vos * Math.abs(gain);
    errors.vosError = vosError;

    // bias current error
    var ibError = c.ib * (rf * 1000);
    errors.ibError = ibError;

    // GBW attenuation
    var actualGain = gain;
    if (c.gbw !== Infinity && freq > 0) {
        var bw = c.gbw / Math.abs(gain);
        var attenuation = 1 / Math.sqrt(1 + Math.pow(freq / bw, 2));
        actualGain = gain * attenuation;
    }
    errors.gbwGainLoss = Math.abs(gain) - Math.abs(actualGain);

    // slew rate check
    var slewLimited = false;
    if (c.slew !== Infinity && freq > 0) {
        var maxSlewNeeded = 2 * Math.PI * freq * Math.abs(idealVout);
        slewLimited = maxSlewNeeded > c.slew;
    }
    errors.slewLimited = slewLimited;

    // real vout
   var realVout = actualGain * vin + vosError + ibError;
    if (realVout > vs) realVout = vs;
    if (realVout < -vs) realVout = -vs;

    return {
        realVout: realVout,
        errors: errors,
        chip: c
    };
}
function actualVout(gain, vin) {
    return gain * vin;
}