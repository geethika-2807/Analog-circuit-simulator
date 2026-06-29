document.getElementById("circuit-select").addEventListener("change", function() {
    var circuit = this.value;

    document.querySelectorAll(".input-section").forEach(function(div) {
        div.style.display = "none";
    });

    document.getElementById("inputs-" + circuit).style.display = "block";

    document.getElementById("warning").textContent = "";
    document.getElementById("results").style.display = "none";
});

document.getElementById("calc-btn").addEventListener("click", function() {
    var circuit = document.getElementById("circuit-select").value;
    var result;

    if (circuit === "inverting") {
        var rin = parseFloat(document.getElementById("rin").value);
        var rf = parseFloat(document.getElementById("rf").value);
        var vin = parseFloat(document.getElementById("vin").value);
        var vs = parseFloat(document.getElementById("vs").value);
        if (isNaN(rin) || isNaN(rf) || isNaN(vin) || isNaN(vs)) {
            document.getElementById("warning").textContent = "Please fill in all values.";
            return;
        }
        result = calculateInverting(rin, rf, vin, vs);

    } else if (circuit === "noninverting") {
        var rin = parseFloat(document.getElementById("rin-ni").value);
        var rf = parseFloat(document.getElementById("rf-ni").value);
        var vin = parseFloat(document.getElementById("vin-ni").value);
        var vs = parseFloat(document.getElementById("vs-ni").value);
        if (isNaN(rin) || isNaN(rf) || isNaN(vin) || isNaN(vs)) {
            document.getElementById("warning").textContent = "Please fill in all values.";
            return;
        }
        result = calculateNonInverting(rin, rf, vin, vs);

    } else if (circuit === "voltageFollower") {
        var vin = parseFloat(document.getElementById("vin-vf").value);
        var vs = parseFloat(document.getElementById("vs-vf").value);
        if (isNaN(vin) || isNaN(vs)) {
            document.getElementById("warning").textContent = "Please fill in all values.";
            return;
        }
        result = calculateVoltagefollower(vin, vs);
    }

    document.getElementById("vout").textContent = "Vout: " + result.vout.toFixed(2) + " V";
    document.getElementById("gain").textContent = "Gain: " + result.gain.toFixed(2);

    if (result.saturated) {
        document.getElementById("warning").textContent = "Op-amp is saturated!";
    } else {
        document.getElementById("warning").textContent = "";
    }

    document.getElementById("results").style.display = "block";
});

document.getElementById("reset-btn").addEventListener("click", function() {
    document.querySelectorAll("input").forEach(function(input) {
        input.value = "";
    });
    document.getElementById("warning").textContent = "";
    document.getElementById("results").style.display = "none";
});