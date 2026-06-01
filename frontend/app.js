let map;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 43.7, lng: -79.42 },
        zoom: 10
    });

    setupAutocomplete();
    setupButtons();
}


function setupButtons() {
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

    findSafeRoutes();
    // Route drawing comes next
    });
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

function findSafeRoutes() {
    const directionsService = new google.maps.DirectionsService();

    directionsService.route({
        origin: document.getElementById("origin").value,
        destination: document.getElementById("destination").value,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true   // tells Google to give all alternatives
    }, async (result, status) => {

        if (status === 'OK') {
            const routes = result.routes;

            // Step 1 — Send all routes to your algorithm
            const scoredRoutes = await scoreAllRoutes(routes);

            // Step 2 — Sort by safety score (lowest = safest)
            scoredRoutes.sort((a, b) => a.safetyScore - b.safetyScore);

            // Step 3 — Take only top 3
            const top3 = scoredRoutes.slice(0, 3);

            // Step 4 — Draw them on the map
            drawRoutesOnMap(result, top3);

            // Step 5 — Show recommendation cards
            displayRouteCards(top3.map(r => r.route), top3.map(r => r.safetyScore));
        }
    });
}

async function scoreAllRoutes(routes) {
    // Eventually this calls your Python backend
    // For now return dummy scores for testing
    return routes.map((route, index) => ({
        index: index,
        route: route,
        summary: route.summary,
        distance: route.legs[0].distance.text,
        duration: route.legs[0].duration.text,
        safetyScore: Math.random() * 10  // replace with real scores later
    }));
}

let renderers = [];

function drawRoutesOnMap(directionsResult, top3) {

    // Clear previous routes
    renderers.forEach(r => r.setMap(null));
    renderers = [];

    top3.forEach((scoredRoute, rank) => {
        const color = rank === 0 ? '#22c55e'   // safest = green
                    : rank === 1 ? '#f59e0b'   // second = yellow
                    : '#ef4444';               // third  = red

        const renderer = new google.maps.DirectionsRenderer({
            map: map,
            directions: directionsResult,
            routeIndex: scoredRoute.index,
            suppressMarkers: rank !== 0,
            polylineOptions: {
                strokeColor: color,
                strokeWeight: rank === 0 ? 6 : 4,    // safest route is thicker
                strokeOpacity: rank === 0 ? 1.0 : 0.6
            }
        });

        renderers.push(renderer);
    });
}