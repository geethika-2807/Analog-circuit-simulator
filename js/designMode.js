var e12Series = [1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2];

function nearestE12(value) {
    var multiplier = 1;
    while (multiplier * 10 <= value) multiplier *= 10;
    
    var best = null;
    var bestDiff = Infinity;
    
    for (var m = multiplier / 10; m <= multiplier * 10; m *= 10) {
        for (var i = 0; i < e12Series.length; i++) {
            var candidate = e12Series[i] * m;
            var diff = Math.abs(candidate - value);
            if (diff < bestDiff) {
                bestDiff = diff;
                best = candidate;
            }
        }
    }
    return best;
}

function designInverting(targetGain, rin) {
    var exactRf = Math.abs(targetGain) * rin;
    var standardRf = nearestE12(exactRf);
    var actualGain = -(standardRf / rin);
    var errorPercent = ((actualGain - targetGain) / Math.abs(targetGain)) * 100;

    return {
        exactRf: exactRf,
        standardRf: standardRf,
        actualGain: actualGain,
        errorPercent: errorPercent
    };
}