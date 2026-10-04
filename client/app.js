var API_URL = "http://127.0.0.1:5000";

function getCheckedValue(name) {
  var checked = document.querySelector('input[name="' + name + '"]:checked');
  return checked ? parseInt(checked.value) : -1;
}

// "1st phase jp nagar" -> "1st Phase Jp Nagar"
function toTitleCase(text) {
  return text.replace(/\b\w/g, function (c) { return c.toUpperCase(); });
}

// 83.5 lakh -> "83,50,000" (Indian digit grouping)
function formatRupees(lakh) {
  return Math.round(lakh * 100000).toLocaleString("en-IN");
}

function showError(message) {
  var error = document.getElementById("uiError");
  error.textContent = message;
  error.hidden = !message;
}

function onClickedEstimatePrice(event) {
  event.preventDefault();
  var sqft = parseFloat(document.getElementById("uiSqft").value);
  var location = document.getElementById("uiLocations").value;
  var button = document.getElementById("uiSubmit");
  var estPrice = document.getElementById("uiEstimatedPrice");

  if (isNaN(sqft) || sqft <= 0) {
    showError("Please enter an area greater than 0.");
    return;
  }
  if (!location) {
    showError("Please choose a location.");
    return;
  }
  showError("");

  button.disabled = true;
  button.textContent = "Calculating…";
  estPrice.hidden = true;

  fetch(API_URL + "/predict_home_price", {
    method: "POST",
    body: new URLSearchParams({
      total_sqft: sqft,
      bhk: getCheckedValue("uiBHK"),
      bath: getCheckedValue("uiBathrooms"),
      location: location
    })
  })
    .then(function (response) {
      if (!response.ok) throw new Error("Server error " + response.status);
      return response.json();
    })
    .then(function (data) {
      var price = data.estimated_price;
      estPrice.innerHTML =
        '<span class="price">₹ ' + price + ' Lakh</span>' +
        '<span class="price-full">≈ ₹ ' + formatRupees(price) + '</span>';
      estPrice.hidden = false;
    })
    .catch(function () {
      showError("Could not get an estimate. Is the Flask server running?");
    })
    .finally(function () {
      button.disabled = false;
      button.textContent = "Estimate Price";
    });
}

function onPageLoad() {
  document.getElementById("priceForm").addEventListener("submit", onClickedEstimatePrice);
  var uiLocations = document.getElementById("uiLocations");

  fetch(API_URL + "/get_location_names")
    .then(function (response) { return response.json(); })
    .then(function (data) {
      uiLocations.innerHTML = '<option value="" disabled selected>Choose a location</option>';
      data.locations.forEach(function (loc) {
        uiLocations.append(new Option(toTitleCase(loc), loc));
      });
    })
    .catch(function () {
      uiLocations.innerHTML = '<option value="" disabled selected>Locations unavailable</option>';
      showError("Cannot reach the server. Start Flask (python server/server.py) and reload the page.");
    });
}

window.onload = onPageLoad;
