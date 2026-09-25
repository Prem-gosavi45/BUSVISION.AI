from fastapi import APIRouter, Query
from backend.supabase_client import supabase

router = APIRouter(
    prefix="/api/traffic",
    tags=["Traffic"]
)


@router.get("/density")
def get_traffic_density(
    period: str = Query(default="24h")
):

    response = (
        supabase
        .table("events")
        .select(
            "timestamp, vehicle_count, "
            "average_vehicle_count, traffic_level, "
            "latitude, longitude, bus_id"
        )
        .eq("event_type", "TRAFFIC")
        .order("timestamp", desc=True)
        .limit(500)
        .execute()
    )

    events = response.data or []

    return {
        "status": "SUCCESS",
        "period": period,
        "count": len(events),
        "data": events
    }