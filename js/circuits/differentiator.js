function calculateDifferentiator(rf, c, vin, vs, freq) {
    var gain = -2 * Math.PI * freq * (rf * 1000) * (c * 1e-6);
    var vout = gain * vin;

    var saturated = false;
    if (vout > vs) { vout = vs; saturated = true; }
    if (vout < -vs) { vout = -vs; saturated = true; }

    return {
        gain: gain,
        vout: vout,
        saturated: saturated,
        phase: 90
    };
}