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
    var result;

    if (circuit === "inverting") {
        var rin = parseFloat(document.getElementById("rin").value);
        var rf  = parseFloat(document.getElementById("rf").value);
        var vin = parseFloat(document.getElementById("vin").value);
        var vs  = parseFloat(document.getElementById("vs").value);
        if (isNaN(rin) || isNaN(rf) || isNaN(vin) || isNaN(vs)) {
            document.getElementById("warning").textContent = "Please fill in all values.";
            return;
        }
        result = calculateInverting(rin, rf, vin, vs);

    } else if (circuit === "noninverting") {
        var rin = parseFloat(document.getElementById("rin-ni").value);
        var rf  = parseFloat(document.getElementById("rf-ni").value);
        var vin = parseFloat(document.getElementById("vin-ni").value);
        var vs  = parseFloat(document.getElementById("vs-ni").value);
        if (isNaN(rin) || isNaN(rf) || isNaN(vin) || isNaN(vs)) {
            document.getElementById("warning").textContent = "Please fill in all values.";
            return;
        }
        result = calculateNonInverting(rin, rf, vin, vs);

    } else if (circuit === "voltageFollower") {
        var vin = parseFloat(document.getElementById("vin-vf").value);
        var vs  = parseFloat(document.getElementById("vs-vf").value);
        if (isNaN(vin) || isNaN(vs)) {
            document.getElementById("warning").textContent = "Please fill in all values.";
            return;
        }
        result = calculateVoltagefollower(vin, vs);

    } else if (circuit === "summingAmp") {
        var count = parseInt(document.getElementById("sum-input-count").value);
        var rf  = parseFloat(document.getElementById("rf-sum").value);
        var vs  = parseFloat(document.getElementById("vs-sum").value);
        var inputs = [];
        for (var i = 1; i <= count; i++) {
            inputs.push({
                v: parseFloat(document.getElementById("v" + i + "-sum").value),
                r: parseFloat(document.getElementById("r" + i + "-sum").value)
            });
        }
        result = calculateSummingAmp(inputs, rf, vs);
    }

    document.getElementById("vout").textContent = "Vout: " + result.vout.toFixed(2) + " V";

    if (result.gains) {
        var gainText = "";
        for (var i = 0; i < result.gains.length; i++) {
            gainText += "Gain " + (i + 1) + ": " + result.gains[i].toFixed(2) + "  ";
        }
        document.getElementById("gain").textContent = gainText;
    } else {
        document.getElementById("gain").textContent = "Gain: " + result.gain.toFixed(2);
    }

    if (result.saturated) {
        document.getElementById("warning").textContent = "Op-amp is saturated!";
    } else {
        document.getElementById("warning").textContent = "";
    }

    document.getElementById("results").style.display = "block";
});

// clear button
document.getElementById("reset-btn").addEventListener("click", function() {
    document.querySelectorAll("input[type='number']").forEach(function(input) {
        input.value = "";
    });
    document.getElementById("warning").textContent = "";
    document.getElementById("results").style.display = "none";
});

// draggable divider
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
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
});
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