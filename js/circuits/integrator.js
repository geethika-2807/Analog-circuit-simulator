function calculateIntegrator(rin, c, vin, vs, freq) {
    if (freq === 0) {
        return {
            gain: Infinity,
            vout: vs,
            saturated: true,
            phase: -90
        };
    }
    var gain = -1 / (2 * Math.PI * freq * (rin * 1000) * (c * 1e-6));
    var vout = gain * vin;

    var saturated = false;
    if (vout > vs) { vout = vs; saturated = true; }
    if (vout < -vs) { vout = -vs; saturated = true; }

    return {
        gain: gain,
        vout: vout,
        saturated: saturated,
        phase: -90
    };
}