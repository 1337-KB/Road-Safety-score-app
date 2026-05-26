let map;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 43.7, lng: -79.42 },
        zoom: 10
    });

    setupAutocomplete();
}

function setupAutocomplete() {
    const originInput = document.getElementById("origin");
    const destInput = document.getElementById("destination");

    new google.maps.places.Autocomplete(originInput, {
        componentRestrictions: { country: "ca" }
    });

    new google.maps.places.Autocomplete(destInput, {
        componentRestrictions: { country: "ca" }
    });
}

document.getElementById("locate-btn").addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            map.setCenter({ lat, lng });
            map.setZoom(14);

            document.getElementById("origin").value = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

            new google.maps.Marker({
                position: { lat, lng },
                map: map,
                title: "You are here"
            });
        });
    }
});


document.getElementById("locate-btn").addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            map.setCenter({ lat, lng });
            map.setZoom(14);

            document.getElementById("origin").value = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

            new google.maps.Marker({
                position: { lat, lng },
                map: map,
                title: "You are here"
            });
        });
    }
});


document.getElementById("search-btn").addEventListener("click", () => {
    const origin = document.getElementById("origin").value;
    const destination = document.getElementById("destination").value;

    if (!origin || !destination) {
        alert("Please enter both fields");
        return;
    }

    console.log("Searching route from", origin, "to", destination);
    // Route drawing comes next
});

function displayRouteCards(routes, safetyScores) {

    // Show the panel
    const panel = document.getElementById("results-panel");
    panel.style.display = "block";

    document.getElementById("results-title").textContent = 
        `${routes.length} routes found — sorted by safety`;

    const container = document.getElementById("route-cards");
    container.innerHTML = "";

    routes.forEach((route, index) => {
        const score = safetyScores[index];
        const distance = route.legs[0].distance.text;
        const duration = route.legs[0].duration.text;
        const summary = route.summary;

        // Determine badge
        let badgeClass, badgeLabel;
        if (score <= 3) {
            badgeClass = "badge-low";
            badgeLabel = `🟢 ${score.toFixed(1)} LOW`;
        } else if (score <= 6) {
            badgeClass = "badge-moderate";
            badgeLabel = `🟡 ${score.toFixed(1)} MODERATE`;
        } else {
            badgeClass = "badge-high";
            badgeLabel = `🔴 ${score.toFixed(1)} HIGH RISK`;
        }

        container.innerHTML += `
            <div class="route-card" onclick="selectRoute(${index})">
                <div>
                    <strong>Via ${summary}</strong>
                    <div class="route-info">${distance} · ${duration}</div>
                </div>
                <span class="safety-badge ${badgeClass}">${badgeLabel}</span>
            </div>
        `;
    });
}