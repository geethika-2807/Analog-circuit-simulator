var e12Series = [1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2];

function nearestE12(value) {
    if (value <= 0) return 1;
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

function verifyChip(chipKey, gain, bandwidth, amplitude, rf) {
    var c = chipData[chipKey];
    var issues = [];
    var warnings = [];

    // GBW check
    if (c.gbw !== Infinity) {
        var maxBW = c.gbw / Math.abs(gain);
        if (bandwidth > maxBW) {
            issues.push("GBW insufficient — max bandwidth at this gain is " + (maxBW/1000).toFixed(1) + " kHz");
        } else if (bandwidth > maxBW * 0.5) {
            warnings.push("GBW marginal — operating near bandwidth limit");
        }
    }

    // slew rate check
    if (c.slew !== Infinity) {
        var requiredSlew = 2 * Math.PI * bandwidth * Math.abs(amplitude * gain);
        if (requiredSlew > c.slew) {
            issues.push("Slew rate insufficient — needs " + (requiredSlew/1e6).toFixed(2) + " V/μs, chip has " + (c.slew/1e6).toFixed(2) + " V/μs");
        }
    }

    // offset voltage check
    var vosError = c.vos * Math.abs(gain) * 1000;
    if (vosError > 100) {
        warnings.push("High offset error: " + vosError.toFixed(1) + " mV at this gain");
    }

    // bias current check
    var ibError = c.ib * rf * 1000 * 1000;
    if (ibError > 10) {
        warnings.push("Bias current error: " + ibError.toFixed(2) + " mV");
    }

    var status;
    if (issues.length === 0 && warnings.length === 0) {
        status = "pass";
    } else if (issues.length === 0) {
        status = "warning";
    } else {
        status = "fail";
    }

    return {
        chip: c.name,
        status: status,
        issues: issues,
        warnings: warnings,
        vosError: vosError,
        ibError: ibError
    };
}

function runDesign(circuit, targetGain, rin, bandwidth, amplitude, vs, errorLimit) {
    var exactRf = Math.abs(targetGain) * rin;
    var standardRf = nearestE12(exactRf);
    var actualGain;

    if (circuit === "inverting") {
        actualGain = -(standardRf / rin);
    } else if (circuit === "noninverting") {
        actualGain = 1 + (standardRf / rin);
    }

    var gainError = Math.abs((actualGain - targetGain) / Math.abs(targetGain)) * 100;

    // verify all chips
    var chipKeys = ["ideal", "lm741", "lm358", "tl071", "opa2134", "opa277", "lmv321"];
    var chipResults = [];
    var bestChip = null;

    chipKeys.forEach(function(key) {
        if (key === "ideal") return;
        var result = verifyChip(key, actualGain, bandwidth, amplitude, standardRf);
        chipResults.push({ key: key, result: result });
        if (result.status === "pass" && !bestChip) {
            bestChip = key;
        }
    });

    return {
        exactRf: exactRf,
        standardRf: standardRf,
        actualGain: actualGain,
        gainError: gainError,
        chipResults: chipResults,
        bestChip: bestChip,
        meetsGainError: gainError <= errorLimit
    };
}