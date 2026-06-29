function calculateInverting(rin, rf, vin, vs) {
    var gain = -(rf / rin);
    var vout = gain * vin;

    var saturated = false;
    if (vout > vs) {
        vout = vs;
        saturated = true;
    } else if (vout < -vs) {
        vout = -vs;
        saturated = true;
    }

    return {
        gain: gain,
        vout: vout,
        saturated: saturated
    };
}