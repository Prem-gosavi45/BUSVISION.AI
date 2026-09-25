from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from datetime import datetime, timezone

from fastapi.middleware.cors import CORSMiddleware

from backend.routes.events import router as events_router
from backend.routes.buses import router as buses_router
from backend.routes.traffic import router as traffic_router


app = FastAPI(
    title="BusVision AI API",
    version="1.0.0"
)

app.include_router(events_router)
app.include_router(buses_router)
app.include_router(traffic_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GPSData(BaseModel):
    bus_id: str
    latitude: float
    longitude: float
    timestamp: str | None = None


latest_gps = {}


@app.get("/")
def root():
    return {
        "message": "BusVision AI API is running"
    }


@app.post("/gps")
def receive_gps(gps: GPSData):

    timestamp = gps.timestamp

    if timestamp is None:
        timestamp = datetime.now(timezone.utc).isoformat()

    latest_gps[gps.bus_id] = {
        "bus_id": gps.bus_id,
        "latitude": gps.latitude,
        "longitude": gps.longitude,
        "timestamp": timestamp
    }

    return {
        "status": "GPS_RECEIVED",
        "data": latest_gps[gps.bus_id]
    }


@app.get("/gps/{bus_id}")
def get_gps(bus_id: str):

    if bus_id not in latest_gps:
        return {
            "status": "NOT_FOUND",
            "bus_id": bus_id
        }

    return {
        "status": "OK",
        "data": latest_gps[bus_id]
    }


@app.get("/gps-page", response_class=HTMLResponse)
def gps_page():

    return """
<!DOCTYPE html>
<html>
<head>
    <title>BusVision Phone GPS</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>

<body style="font-family: Arial; padding: 25px;">

    <h2>🚌 BusVision AI - Phone GPS</h2>

    <p id="status">Starting GPS...</p>

    <p>
        Latitude:
        <strong id="latitude">--</strong>
    </p>

    <p>
        Longitude:
        <strong id="longitude">--</strong>
    </p>

    <p>
        Accuracy:
        <strong id="accuracy">--</strong> meters
    </p>

<script>

const BUS_ID = "BUS_101";

function updateGPS(position) {

    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const accuracy = position.coords.accuracy;

    document.getElementById("latitude").innerText =
        latitude.toFixed(6);

    document.getElementById("longitude").innerText =
        longitude.toFixed(6);

    document.getElementById("accuracy").innerText =
        accuracy.toFixed(1);

    document.getElementById("status").innerText =
        "GPS active - sending location...";

    fetch("/gps", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            bus_id: BUS_ID,
            latitude: latitude,
            longitude: longitude,
            timestamp: new Date().toISOString()
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log("GPS sent:", data);
    })
    .catch(error => {
        console.error("GPS send error:", error);

        document.getElementById("status").innerText =
            "GPS detected but sending failed";
    });
}


function gpsError(error) {

    document.getElementById("status").innerText =
        "GPS error: " + error.message;

}


if ("geolocation" in navigator) {

    navigator.geolocation.watchPosition(
        updateGPS,
        gpsError,
        {
            enableHighAccuracy: true,
            maximumAge: 2000,
            timeout: 10000
        }
    );

} else {

    document.getElementById("status").innerText =
        "Geolocation is not supported by this browser.";

}

</script>

</body>
</html>
"""