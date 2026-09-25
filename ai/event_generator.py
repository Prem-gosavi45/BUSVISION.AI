from datetime import datetime, timezone


# ============================================================
# TRAFFIC EVENT
# ============================================================

def create_traffic_event(
    bus_id: str,
    vehicle_count: int,
    average_vehicle_count: float,
    traffic_level: str,
    latitude=None,
    longitude=None,
):
    """
    Create a standardized traffic event.
    """

    event = {
        "event_type": "TRAFFIC",
        "bus_id": bus_id,
        "vehicle_count": vehicle_count,
        "average_vehicle_count": round(
            average_vehicle_count,
            1
        ),
        "traffic_level": traffic_level,
        "timestamp": datetime.now(
            timezone.utc
        ).isoformat(),
        "latitude": latitude,
        "longitude": longitude,
        "status": "DETECTED",
    }

    return event


# ============================================================
# POTHOLE EVENT
# ============================================================

def create_pothole_event(
    bus_id: str,
    pothole_id,
    confidence: float,
    size_category: str,
    width_px: int,
    height_px: int,
    area_px: int,
    area_percent: float,
    latitude=None,
    longitude=None,
    snapshot_path=None,
    crop_path=None,
):
    """
    Create a standardized pothole event.
    """

    event = {
        "event_type": "POTHOLE",

        "bus_id": bus_id,

        "pothole_id": pothole_id,

        "confidence": round(
            float(confidence),
            3
        ),

        "size_category": size_category,

        "width_px": int(width_px),

        "height_px": int(height_px),

        "area_px": int(area_px),

        "area_percent": round(
            float(area_percent),
            3
        ),

        "latitude": latitude,

        "longitude": longitude,

        "timestamp": datetime.now(
            timezone.utc
        ).isoformat(),

        "snapshot_path": snapshot_path,

        "crop_path": crop_path,

        "status": "DETECTED",
    }

    return event


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    # ----------------------------------------
    # Test Traffic Event
    # ----------------------------------------

    traffic_event = create_traffic_event(
        bus_id="BUS_101",
        vehicle_count=24,
        average_vehicle_count=22.7,
        traffic_level="HIGH",
        latitude=None,
        longitude=None,
    )

    print()
    print("Generated Traffic Event:")
    print(traffic_event)


    # ----------------------------------------
    # Test Pothole Event
    # ----------------------------------------

    pothole_event = create_pothole_event(
        bus_id="BUS_101",
        pothole_id=1,
        confidence=0.86,
        size_category="MEDIUM",
        width_px=100,
        height_px=190,
        area_px=19000,
        area_percent=0.21,
        latitude=None,
        longitude=None,
        snapshot_path="runs/pothole_live/snapshots/pothole_0001.jpg",
        crop_path="runs/pothole_live/pothole_crops/pothole_0001.jpg",
    )

    print()
    print("Generated Pothole Event:")
    print(pothole_event)