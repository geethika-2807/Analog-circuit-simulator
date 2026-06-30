function calculateSummingAmp(inputs, rf, vs) {
    var sum = 0;
    var gains = [];

    for (var i = 0; i < inputs.length; i++) {
        sum += inputs[i].v / inputs[i].r;
        gains.push(-(rf / inputs[i].r));
    }

    var vout = -rf * sum;
    var saturated = false;

    if (vout > vs) {
        vout = vs;
        saturated = true;
    } else if (vout < -vs) {
        vout = -vs;
        saturated = true;
    }

    return {
        gains: gains,
        vout: vout,
        saturated: saturated
    };
}