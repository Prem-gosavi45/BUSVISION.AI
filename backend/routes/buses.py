from fastapi import APIRouter
from backend.supabase_client import supabase

router = APIRouter(
    prefix="/api/buses",
    tags=["Buses"]
)


@router.get("")
def get_buses():

    response = (
        supabase
        .table("events")
        .select("bus_id, latitude, longitude, timestamp")
        .not_.is_("bus_id", "null")
        .order("timestamp", desc=True)
        .execute()
    )

    rows = response.data or []

    # Latest location per bus
    buses = {}

    for row in rows:

        bus_id = row.get("bus_id")

        if not bus_id:
            continue

        if bus_id not in buses:
            buses[bus_id] = {
                "bus_id": bus_id,
                "latitude": row.get("latitude"),
                "longitude": row.get("longitude"),
                "timestamp": row.get("timestamp"),
                "status": "ACTIVE"
            }

    return list(buses.values())