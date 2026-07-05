var lastCalcState = null;

// toggle section
function toggleSection(id, titleEl) {
    var el = document.getElementById(id);
    var arrow = titleEl.querySelector(".arrow");
    if (el.style.display === "none") {
        el.style.display = "flex";
        arrow.textContent = "▼";
    } else {
        el.style.display = "none";
        arrow.textContent = "▶";
    }
}

// highlight active radio option
document.querySelectorAll(".radio-opt input").forEach(function(radio) {
    radio.addEventListener("change", function() {
        document.querySelectorAll("input[name='" + this.name + "']").forEach(function(r) {
            r.parentElement.classList.remove("active");
        });
        this.parentElement.classList.add("active");
    });
});

// circuit change
document.querySelectorAll("input[name='circuit']").forEach(function(radio) {
    radio.addEventListener("change", function() {
        var circuit = this.value;
        document.querySelectorAll(".input-section").forEach(function(div) {
            div.style.display = "none";
        });
        document.getElementById("inputs-" + circuit).style.display = "block";
        document.getElementById("warning").textContent = "";
        document.getElementById("results").style.display = "none";
        document.getElementById("real-results").style.display = "none";
        lastCalcState = null;
        document.getElementById("waveform-panel").style.display = "none";
        document.getElementById("inner-divider").style.display = "none";
    });
});

// op-amp model change
document.querySelectorAll("input[name='opamp']").forEach(function(radio) {
    radio.addEventListener("change", function() {
        var chip = this.value;
        if (chip === "ideal") {
            document.getElementById("freq-input").style.display = "none";
        } else {
            document.getElementById("freq-input").style.display = "block";
        }
        document.getElementById("results").style.display = "none";
        document.getElementById("real-results").style.display = "none";
        if (lastCalcState) {
            lastCalcState.chip = chip;
            showWaveform(lastCalcState.result, chip, lastCalcState.gain, lastCalcState.vin, lastCalcState.rf, lastCalcState.freq, lastCalcState.vs);
        }
    });
});

// waveform type change
document.querySelectorAll("input[name='waveform']").forEach(function(radio) {
    radio.addEventListener("change", function() {
        if (lastCalcState) {
            showWaveform(lastCalcState.result, lastCalcState.chip, lastCalcState.gain, lastCalcState.vin, lastCalcState.rf, lastCalcState.freq, lastCalcState.vs);
        }
    });
});

// summing amp dynamic inputs
function updateSummingInputs() {
    var count = parseInt(document.getElementById("sum-input-count").value);
    var container = document.getElementById("summing-inputs");
    container.innerHTML = "";
    for (var i = 1; i <= count; i++) {
        container.innerHTML +=
            '<div class="input-group">' +
                '<label>V' + i + ' (V)</label>' +
                '<input type="number" id="v' + i + '-sum" placeholder="Enter V' + i + '">' +
            '</div>' +
            '<div class="input-group">' +
                '<label>R' + i + ' (kΩ)</label>' +
                '<input type="number" id="r' + i + '-sum" placeholder="Enter R' + i + '">' +
            '</div>';
    }
}
document.getElementById("sum-input-count").addEventListener("change", updateSummingInputs);
updateSummingInputs();

// calculate button
document.getElementById("calc-btn").addEventListener("click", function() {
    var circuit = document.querySelector("input[name='circuit']:checked").value;
    var chip = document.querySelector("input[name='opamp']:checked").value;
    var freq = parseFloat(document.getElementById("freq").value) || 0;
    var result;
    var rf = 0;
    var vin = 0;
    var vs = 0;

    if (circuit === "inverting") {
        var rin = parseFloat(document.getElementById("rin").value);
        rf = parseFloat(document.getElementById("rf").value);
        vin = parseFloat(document.getElementById("vin").value);
        vs = parseFloat(document.getElementById("vs").value);
        if (isNaN(rin) || isNaN(rf) || isNaN(vin) || isNaN(vs)) {
            document.getElementById("warning").textContent = "Please fill in all values.";
            return;
        }
        result = calculateInverting(rin, rf, vin, vs);

    } else if (circuit === "noninverting") {
        var rin = parseFloat(document.getElementById("rin-ni").value);
        rf = parseFloat(document.getElementById("rf-ni").value);
        vin = parseFloat(document.getElementById("vin-ni").value);
        vs = parseFloat(document.getElementById("vs-ni").value);
        if (isNaN(rin) || isNaN(rf) || isNaN(vin) || isNaN(vs)) {
            document.getElementById("warning").textContent = "Please fill in all values.";
            return;
        }
        result = calculateNonInverting(rin, rf, vin, vs);

    } else if (circuit === "voltageFollower") {
        vin = parseFloat(document.getElementById("vin-vf").value);
        vs = parseFloat(document.getElementById("vs-vf").value);
        if (isNaN(vin) || isNaN(vs)) {
            document.getElementById("warning").textContent = "Please fill in all values.";
            return;
        }
        result = calculatevoltageFollower(vin, vs);
        rf = 0;

    } else if (circuit === "summingAmp") {
        var count = parseInt(document.getElementById("sum-input-count").value);
        rf = parseFloat(document.getElementById("rf-sum").value);
        vs = parseFloat(document.getElementById("vs-sum").value);
        var inputs = [];
        for (var i = 1; i <= count; i++) {
            inputs.push({
                v: parseFloat(document.getElementById("v" + i + "-sum").value),
                r: parseFloat(document.getElementById("r" + i + "-sum").value)
            });
        }
        result = calculateSummingAmp(inputs, rf, vs);
        vin = inputs[0].v;

    } else if (circuit === "integrator") {
        var rin = parseFloat(document.getElementById("rin-int").value);
        var c = parseFloat(document.getElementById("c-int").value);
        vin = parseFloat(document.getElementById("vin-int").value);
        vs = parseFloat(document.getElementById("vs-int").value);
        if (isNaN(rin) || isNaN(c) || isNaN(vin) || isNaN(vs)) {
            document.getElementById("warning").textContent = "Please fill in all values.";
            return;
        }
        result = calculateIntegrator(rin, c, vin, vs, freq);
        rf = 0;

    } else if (circuit === "differentiator") {
        rf = parseFloat(document.getElementById("rf-diff").value);
        var c = parseFloat(document.getElementById("c-diff").value);
        vin = parseFloat(document.getElementById("vin-diff").value);
        vs = parseFloat(document.getElementById("vs-diff").value);
        if (isNaN(rf) || isNaN(c) || isNaN(vin) || isNaN(vs)) {
            document.getElementById("warning").textContent = "Please fill in all values.";
            return;
        }
        result = calculateDifferentiator(rf, c, vin, vs, freq);
    }

    // show ideal results
    document.getElementById("vout").textContent = "Ideal Vout: " + result.vout.toFixed(4) + " V";
    document.getElementById("gain").textContent = "Gain: " + result.gain.toFixed(4) +
        (result.phase !== undefined ? " | Phase: " + result.phase + "°" : "");

    if (result.saturated) {
        document.getElementById("warning").textContent = "Op-amp is saturated!";
    } else {
        document.getElementById("warning").textContent = "";
    }

    document.getElementById("results").style.display = "flex";

    // show real results if non-ideal chip selected
    if (chip !== "ideal") {
        var gain = result.gain !== undefined ? result.gain : result.gains[0];
        var nonIdeal = applyNonidealities(result.vout, chip, gain, vin, rf, freq, vs);

        document.getElementById("real-vout").textContent =
            "Real Vout: " + nonIdeal.realVout.toFixed(4) + " V";
        document.getElementById("vos-error").textContent =
            "Offset voltage error: " + (nonIdeal.errors.vosError * 1000).toFixed(3) + " mV";
        document.getElementById("ib-error").textContent =
            "Bias current error: " + (nonIdeal.errors.ibError * 1000).toFixed(3) + " mV";
        document.getElementById("gbw-error").textContent =
            "GBW gain loss: " + nonIdeal.errors.gbwGainLoss.toFixed(4);
        document.getElementById("slew-status").textContent =
            "Slew rate: " + (nonIdeal.errors.slewLimited ? "⚠ Distortion present" : "✓ No distortion");
        document.getElementById("chip-desc").textContent =
            nonIdeal.chip.description;

        document.getElementById("real-results").style.display = "block";
    } else {
        document.getElementById("real-results").style.display = "none";
    }

    // store state and show waveform
    var gainForWave;
    if (result.gain !== undefined && result.gain !== null) {
        gainForWave = result.gain;
    } else if (result.gains && result.gains.length > 0) {
        gainForWave = result.gains[0];
    } else {
        gainForWave = 1;
    }
    // for voltage follower, offset slightly so both lines are visible
    if (Math.abs(gainForWave) === 1 && circuit === "voltageFollower") {
        gainForWave = 1.0;
    }
    lastCalcState = {
        result: result,
        chip: chip,
        gain: gainForWave,
        vin: vin,
        rf: rf,
        freq: freq,
        vs: vs
    };
    showWaveform(result, chip, gainForWave, vin, rf, freq, vs);
});

// clear button
document.getElementById("reset-btn").addEventListener("click", function() {
    document.querySelectorAll("input[type='number']").forEach(function(input) {
        input.value = "";
    });
    document.getElementById("warning").textContent = "";
    document.getElementById("results").style.display = "none";
    document.getElementById("real-results").style.display = "none";
    document.getElementById("waveform-panel").style.display = "none";
    document.getElementById("inner-divider").style.display = "none";
    lastCalcState = null;
});

// draggable left divider
var divider = document.getElementById("divider");
var leftPanel = document.getElementById("left-panel");
var isDragging = false;

divider.addEventListener("mousedown", function(e) {
    isDragging = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
});

document.addEventListener("mousemove", function(e) {
    if (!isDragging) return;
    var newWidth = e.clientX;
    if (newWidth < 150) newWidth = 150;
    if (newWidth > 400) newWidth = 400;
    leftPanel.style.width = newWidth + "px";
});

document.addEventListener("mouseup", function() {
    isDragging = false;
    isInnerDragging = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    if (lastCalcState && lastCalcState.inputPoints) {
        setTimeout(function() {
            drawWaveform(lastCalcState.inputPoints, lastCalcState.idealPoints, lastCalcState.realPoints, lastCalcState.vs, lastCalcState.frequency);
        }, 50);
    }
});

// design mode toggle
var isDesignMode = false;

function toggleMode() {
    isDesignMode = !isDesignMode;
    var btn = document.getElementById("mode-btn");
    var workspace = document.getElementById("input-area");
    var actionBar = document.getElementById("action-bar");
    var designMode = document.getElementById("design-mode");
    var results = document.getElementById("results");
    var realResults = document.getElementById("real-results");

    if (isDesignMode) {
        btn.textContent = "Switch to Analysis Mode";
        workspace.style.display = "none";
        actionBar.style.display = "none";
        designMode.style.display = "block";
        results.style.display = "none";
        realResults.style.display = "none";
    } else {
        btn.textContent = "Switch to Design Mode";
        workspace.style.display = "block";
        actionBar.style.display = "flex";
        designMode.style.display = "none";
    }
}

document.getElementById("design-btn").addEventListener("click", function() {
    var targetGain = parseFloat(document.getElementById("target-gain").value);
    var rin = parseFloat(document.getElementById("design-rin").value);

    if (isNaN(targetGain) || isNaN(rin)) {
        alert("Please fill in all values.");
        return;
    }

    var result = designInverting(targetGain, rin);

    document.getElementById("exact-rf").textContent =
        "Exact Rf needed: " + result.exactRf.toFixed(2) + " kΩ";
    document.getElementById("standard-rf").textContent =
        "Nearest E12 standard value: " + result.standardRf + " kΩ";
    document.getElementById("actual-gain").textContent =
        "Actual gain with standard Rf: " + result.actualGain.toFixed(4);
    document.getElementById("gain-error").textContent =
        "Error from target: " + result.errorPercent.toFixed(2) + "%";

    document.getElementById("design-results").style.display = "block";
});

// inner divider drag
var innerDivider = document.getElementById("inner-divider");
var waveformPanel = document.getElementById("waveform-panel");
var workspaceArea = document.getElementById("workspace-area");
var isInnerDragging = false;

innerDivider.addEventListener("mousedown", function(e) {
    isInnerDragging = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
});

document.addEventListener("mousemove", function(e) {
    if (!isInnerDragging) return;
    var rightPanel = document.getElementById("right-panel");
    var rightPanelLeft = rightPanel.getBoundingClientRect().left;
    var newWorkspaceWidth = e.clientX - rightPanelLeft;
    if (newWorkspaceWidth < 300) newWorkspaceWidth = 300;
    if (newWorkspaceWidth > 800) newWorkspaceWidth = 800;
    workspaceArea.style.width = newWorkspaceWidth + "px";
    workspaceArea.style.flex = "none";
});

// waveform generation
function generateWave(type, amplitude, frequency, sampleCount, cycles) {
    var points = [];
    for (var i = 0; i < sampleCount; i++) {
        var phase = 2 * Math.PI * frequency * (i / sampleCount) * cycles / frequency;
        var v;
        if (type === "sine") {
            v = amplitude * Math.sin(phase);
        } else if (type === "square") {
            v = amplitude * (Math.sin(phase) >= 0 ? 1 : -1);
        } else if (type === "triangle") {
            v = amplitude * (2 / Math.PI) * Math.asin(Math.sin(phase));
        }
        points.push(v);
    }
    return points;
}

function applySlew(points, slewRate, dt) {
    if (slewRate === Infinity) return points;
    var out = points.slice();
    var maxDelta = slewRate * dt;
    for (var i = 1; i < out.length; i++) {
        var delta = out[i] - out[i - 1];
        if (Math.abs(delta) > maxDelta) {
            out[i] = out[i - 1] + (delta > 0 ? maxDelta : -maxDelta);
        }
    }
    return out;
}

function drawWaveform(inputPoints, idealPoints, realPoints, maxVoltage, frequency) {
    var canvas = document.getElementById("waveform-canvas");
    var W = canvas.offsetWidth;
    var H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;
    var ctx = canvas.getContext("2d");

    ctx.fillStyle = "#0d1117";
    ctx.fillRect(0, 0, W, H);

    var padL = 55, padB = 35, padT = 15, padR = 15;
    var plotW = W - padL - padR;
    var plotH = H - padT - padB;

    var allPoints = inputPoints.concat(idealPoints).concat(realPoints);
    var maxVal = Math.max.apply(null, allPoints.map(Math.abs));
    if (maxVal === 0) maxVal = 1;

    // y axis grid, ticks and labels
    ctx.font = "10px Arial";
    ctx.textAlign = "right";
    var ySteps = 8;
    for (var i = 0; i <= ySteps; i++) {
        var val = maxVal - (i / ySteps) * 2 * maxVal;
        var y = padT + (i / ySteps) * plotH;

        // grid line
        ctx.strokeStyle = "rgba(255,255,255,0.06)";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(padL + plotW, y);
        ctx.stroke();

        // tick mark
        ctx.strokeStyle = "rgba(255,255,255,0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padL - 5, y);
        ctx.lineTo(padL, y);
        ctx.stroke();

        // label
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.fillText(val.toFixed(2) + "V", padL - 8, y + 3);
    }

    // y axis line
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + plotH);
    ctx.stroke();

    // x axis grid, ticks and labels
    ctx.textAlign = "center";
    var cycles = 3;
    var totalTime = cycles / (frequency || 1000);
    var xSteps = 6;

    // auto unit — use μs if period < 1ms
    var useUs = totalTime < 0.001;
    var timeMultiplier = useUs ? 1e6 : 1e3;
    var timeUnit = useUs ? "μs" : "ms";

    for (var i = 0; i <= xSteps; i++) {
        var t = (i / xSteps) * totalTime * timeMultiplier;
        var x = padL + (i / xSteps) * plotW;

        // grid line
        ctx.strokeStyle = "rgba(255,255,255,0.06)";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x, padT);
        ctx.lineTo(x, padT + plotH);
        ctx.stroke();

        // tick mark
        ctx.strokeStyle = "rgba(255,255,255,0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, padT + plotH);
        ctx.lineTo(x, padT + plotH + 5);
        ctx.stroke();

        // label
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.fillText(t.toFixed(2) + timeUnit, x, H - padB + 18);
    }

    // x axis line
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, padT + plotH);
    ctx.lineTo(padL + plotW, padT + plotH);
    ctx.stroke();

    // center line (zero voltage)
    var midY = padT + plotH / 2;
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padL, midY);
    ctx.lineTo(padL + plotW, midY);
    ctx.stroke();
    ctx.setLineDash([]);

    // axis labels
    ctx.save();
    ctx.translate(12, padT + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "10px Arial";
    ctx.fillText("Voltage (V)", 0, 0);
    ctx.restore();

    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fillText("Time (" + timeUnit + ")", padL + plotW / 2, H - 4);

    var scale = (plotH / 2 - 5) / maxVal;

    function drawLine(points, color, dash, width) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = width || 1.5;
        ctx.setLineDash(dash || []);
        for (var i = 0; i < points.length; i++) {
            var x = padL + (i / points.length) * plotW;
            var y = midY - points[i] * scale;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
    }

    drawLine(inputPoints, "#378ADD", [4, 3], 1.5);
    drawLine(idealPoints, "#1D9E75", [], 2);
    drawLine(realPoints, "#D85A30", [], 1.5);
}

function showWaveform(result, chip, gain, vin, rf, freq, vs) {
    var waveType = document.querySelector("input[name='waveform']:checked");
    if (!waveType) return;

    var type = waveType.value;
    var amplitude = Math.abs(vin) || 1;
    var frequency = freq || 1000;
    var sampleCount = 500;
    var cycles = 3;

    // handle very small or zero gain
    if (gain === 0 || isNaN(gain)) gain = 1;

    var inputPoints = generateWave(type, amplitude, frequency, sampleCount, cycles);

    var idealPoints = inputPoints.map(function(v) {
        var val = gain * v;
        if (val > vs) return vs;
        if (val < -vs) return -vs;
        return val;
    });

    var c = chipData[chip];
    var dt = (cycles / frequency) / sampleCount;

    var realPoints = inputPoints.map(function(v) {
        var actualGain = gain;
        if (c.gbw !== Infinity && frequency > 0) {
            var bw = c.gbw / Math.abs(gain);
            var attenuation = 1 / Math.sqrt(1 + Math.pow(frequency / bw, 2));
            actualGain = gain * attenuation;
        }
        return actualGain * v + c.vos * Math.abs(gain);
    });

    realPoints = applySlew(realPoints, c.slew, dt);

    realPoints = realPoints.map(function(v) {
        if (v > vs) return vs;
        if (v < -vs) return -vs;
        return v;
    });

    // store points for resize redraw
    if (lastCalcState) {
        lastCalcState.inputPoints = inputPoints;
        lastCalcState.idealPoints = idealPoints;
        lastCalcState.realPoints = realPoints;
        lastCalcState.frequency = frequency;
    }

    document.getElementById("waveform-panel").style.display = "flex";
    document.getElementById("inner-divider").style.display = "block";

    setTimeout(function() {
        drawWaveform(inputPoints, idealPoints, realPoints, vs, frequency);
    }, 50);
}
function showWaveform(result, chip, gain, vin, rf, freq, vs) {
    var waveType = document.querySelector("input[name='waveform']:checked");
    if (!waveType) return;

    var type = waveType.value;
    var amplitude = Math.abs(vin) || 1;
    var frequency = freq || 1000;
    var sampleCount = 500;
    var cycles = 3;

    var inputPoints = generateWave(type, amplitude, frequency, sampleCount, cycles);

    var idealPoints = inputPoints.map(function(v) {
        var val = gain * v;
        if (val > vs) return vs;
        if (val < -vs) return -vs;
        return val;
    });

    var c = chipData[chip];
    var dt = (cycles / frequency) / sampleCount;

    var realPoints = inputPoints.map(function(v) {
        var actualGain = gain;
        if (c.gbw !== Infinity && frequency > 0) {
            var bw = c.gbw / Math.abs(gain);
            var attenuation = 1 / Math.sqrt(1 + Math.pow(frequency / bw, 2));
            actualGain = gain * attenuation;
        }
        return actualGain * v + c.vos * Math.abs(gain);
    });

    realPoints = applySlew(realPoints, c.slew, dt);

    realPoints = realPoints.map(function(v) {
        if (v > vs) return vs;
        if (v < -vs) return -vs;
        return v;
    });

    // store points for resize redraw
    if (lastCalcState) {
        lastCalcState.inputPoints = inputPoints;
        lastCalcState.idealPoints = idealPoints;
        lastCalcState.realPoints = realPoints;
        lastCalcState.frequency = frequency;
    }

    document.getElementById("waveform-panel").style.display = "flex";
    document.getElementById("inner-divider").style.display = "block";

    setTimeout(function() {
        drawWaveform(inputPoints, idealPoints, realPoints, vs, frequency);
    }, 50);
}