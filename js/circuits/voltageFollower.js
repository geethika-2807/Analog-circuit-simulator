function calculatevoltageFollower(vin,vs){
    var gain=1;
    var vout=vin;
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