let map = L.map('mapid').setView([-30.5595, 22.9375], 5); // Center on South Africa
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

let sitesLayer = L.layerGroup().addTo(map);
let tracesLayer = L.layerGroup().addTo(map);

let sitesData = null;
let tracesData = null;

function parseCSV(file, callback, completeCallback) {
    Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: function(results) {
            callback(results.data);
            if (completeCallback) {
                completeCallback();
            }
        }
    });
}
function processSites(data) {
    data.forEach(function(row) {
        if(row.lat !== null && row.lng !== null) {
            L.circle([row.lat, row.lng], { radius: 500 }).addTo(sitesLayer);
        }
    });
}

function processTraces(data) {
    data.forEach(function(row, index) {
        if (index < data.length - 1) {
            let nextRow = data[index + 1];
            if(row.lat !== null && row.lng !== null && nextRow.lat !== null && nextRow.lng !== null) {
                let trace = turf.lineString([[row.lng, row.lat], [nextRow.lng, nextRow.lat]]);
                let totalLength = turf.length(trace, {units: 'meters'});
                let interval = 100; // Add a point every 100 meters
                for(let i=0; i<totalLength; i+=interval) {
                    let interpolatedPoint = turf.along(trace, i, {units: 'meters'});
                    trace.geometry.coordinates.push([interpolatedPoint.geometry.coordinates[0], interpolatedPoint.geometry.coordinates[1]]);
                }
                let geojsonLayer = L.geoJSON(trace);
                geojsonLayer.feature = trace; // Store the GeoJSON feature directly
                tracesLayer.addLayer(geojsonLayer);
            }
        }
    });
}
function checkAndCalculateIntersection() {
    if (sitesData !== null && tracesData !== null) {
        calculateIntersection();
    }
}

function calculateIntersection() {
    console.log("Calculating intersection")
    let intersectionCount = 0;
    sitesLayer.eachLayer(function(siteCircle) {
        let siteLatLng = siteCircle.getLatLng();
        let site = turf.circle([siteLatLng.lng, siteLatLng.lat], 500, { units: 'meters', steps: 100 });
        console.log(site);
        tracesLayer.eachLayer(function(traceLineLayer) {
            let lineCoords = traceLineLayer.feature.geometry.coordinates; // Access the stored GeoJSON feature
            console.log(lineCoords)
            for(let i=0; i<lineCoords.length; i++) {
                let point = turf.point([lineCoords[i][0], lineCoords[i][1]]);
                console.log(point);
                if(turf.booleanPointInPolygon(point, site)) {
                    intersectionCount++;
                    console.log("Found intersection");
                    break;
                }
            }
        });
    });

    document.getElementById('intersect_count').innerText = intersectionCount;
}


document.getElementById('sites').addEventListener('change', function(event) {
    parseCSV(event.target.files[0], processSites, function() {
        sitesData = event.target.files[0];
        checkAndCalculateIntersection();
    });
});

document.getElementById('traces').addEventListener('change', function(event) {
    parseCSV(event.target.files[0], processTraces, function() {
        tracesData = event.target.files[0];
        checkAndCalculateIntersection();
    });
});
