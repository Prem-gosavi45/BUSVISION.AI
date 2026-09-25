from fastapi import APIRouter, Query, HTTPException
from datetime import datetime, timezone
from pydantic import BaseModel

from backend.supabase_events import save_event
from backend.supabase_client import supabase
from backend.geocoding import reverse_geocode
from backend.supabase_storage import get_public_url


router = APIRouter(
    prefix="/api/events",
    tags=["Events"],
)


# =========================================================
# MODELS
# =========================================================

class TrafficEvent(BaseModel):
    event_type: str
    bus_id: str

    vehicle_count: int
    average_vehicle_count: float
    traffic_level: str

    timestamp: str | None = None

    latitude: float | None = None
    longitude: float | None = None

    location_name: str | None = None
    road_name: str | None = None
    neighbourhood: str | None = None
    suburb: str | None = None
    city: str | None = None
    state: str | None = None
    postcode: str | None = None

    status: str = "DETECTED"


class PotholeEvent(BaseModel):
    event_type: str
    bus_id: str

    pothole_id: int
    confidence: float

    size_category: str

    width_px: int
    height_px: int

    area_px: int
    area_percent: float

    latitude: float | None = None
    longitude: float | None = None

    location_name: str | None = None
    road_name: str | None = None
    neighbourhood: str | None = None
    suburb: str | None = None
    city: str | None = None
    state: str | None = None
    postcode: str | None = None

    timestamp: str | None = None

    snapshot_path: str | None = None
    crop_path: str | None = None

    status: str = "DETECTED"


# =========================================================
# HELPERS
# =========================================================

def _is_http_url(value: str | None) -> bool:
    """
    Check whether the value is already a browser-loadable URL.
    """
    if not value:
        return False

    value = str(value).strip().lower()

    return value.startswith("http://") or value.startswith("https://")


def _public_evidence_urls(event: dict) -> dict:
    """
    Convert Supabase Storage paths into public browser URLs.

    Database can contain:
        test/snapshot.jpg

    Frontend receives:
        https://....supabase.co/storage/v1/object/public/pothole-images/test/snapshot.jpg

    If the database already contains a full HTTP URL, do not convert it again.
    """

    if event.get("event_type") != "POTHOLE":
        return event

    result = dict(event)

    for field in ("snapshot_path", "crop_path"):

        value = result.get(field)

        if not value:
            continue

        # Already a public URL.
        if _is_http_url(value):
            continue

        try:
            result[field] = get_public_url(value)

        except Exception as exc:
            print(
                f"{field} public URL generation failed: {exc}"
            )

            # Keep original storage path if URL generation fails.
            result[field] = value

    return result


def _prepare_event(event: dict) -> dict:
    """
    Normalize event before Pydantic validation and database insert.
    """

    event = dict(event)

    # =====================================================
    # EVENT TYPE
    # =====================================================

    event_type = event.get("event_type")

    if not event_type:
        raise HTTPException(
            status_code=400,
            detail="event_type is required",
        )

    event_type = str(event_type).upper()

    if event_type not in {
        "POTHOLE",
        "TRAFFIC",
    }:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported event_type: {event_type}",
        )

    event["event_type"] = event_type

    # =====================================================
    # TIMESTAMP
    # =====================================================

    if event.get("timestamp") is None:

        event["timestamp"] = (
            datetime
            .now(timezone.utc)
            .isoformat()
        )

    # =====================================================
    # GPS → HUMAN READABLE LOCATION
    # =====================================================

    latitude = event.get("latitude")
    longitude = event.get("longitude")

    if (
        latitude is not None
        and longitude is not None
    ):

        try:

            location = reverse_geocode(
                latitude,
                longitude,
            )

        except Exception as exc:

            print(
                f"Reverse geocoding failed: {exc}"
            )

            location = None

        if location:

            event["location_name"] = (
                location.get("display_name")
                or event.get("location_name")
            )

            event["road_name"] = (
                location.get("road")
                or event.get("road_name")
                or ""
            )

            event["neighbourhood"] = (
                location.get("neighbourhood")
                or event.get("neighbourhood")
            )

            event["suburb"] = (
                location.get("suburb")
                or event.get("suburb")
            )

            event["city"] = (
                location.get("city")
                or event.get("city")
            )

            event["state"] = (
                location.get("state")
                or event.get("state")
            )

            event["postcode"] = (
                location.get("postcode")
                or event.get("postcode")
            )

        else:

            event.setdefault(
                "location_name",
                None,
            )

            event.setdefault(
                "road_name",
                "",
            )

    return event


def _validate_event(event: dict) -> dict:

    if event["event_type"] == "TRAFFIC":

        validated = TrafficEvent(
            **event
        )

        return validated.model_dump()

    if event["event_type"] == "POTHOLE":

        validated = PotholeEvent(
            **event
        )

        return validated.model_dump()

    raise HTTPException(
        status_code=400,
        detail="Unsupported event type",
    )


# =========================================================
# GET ALL EVENTS
# =========================================================

@router.get("")
def fetch_events(
    limit: int = Query(
        default=500,
        ge=1,
        le=1000,
    ),
    event_type: str | None = Query(
        default=None,
    ),
):

    query = (
        supabase
        .table("events")
        .select("*")
        .order(
            "timestamp",
            desc=True,
        )
        .limit(limit)
    )

    if event_type:

        query = query.eq(
            "event_type",
            event_type.upper(),
        )

    response = query.execute()

    rows = response.data or []

    # Convert storage paths → public URLs
    # ONLY for frontend response.
    return [
        _public_evidence_urls(row)
        for row in rows
    ]


# =========================================================
# GET LATEST EVENTS
# =========================================================

@router.get("/latest")
def fetch_latest_events(
    limit: int = Query(
        default=10,
        ge=1,
        le=100,
    ),
):

    response = (
        supabase
        .table("events")
        .select("*")
        .order(
            "timestamp",
            desc=True,
        )
        .limit(limit)
        .execute()
    )

    rows = response.data or []

    return [
        _public_evidence_urls(row)
        for row in rows
    ]


# =========================================================
# RECEIVE EVENT
# =========================================================

@router.post("")
def receive_event(
    event: dict,
):

    # -----------------------------------------------------
    # PREPARE
    # -----------------------------------------------------

    event = _prepare_event(event)

    # -----------------------------------------------------
    # VALIDATE
    # -----------------------------------------------------

    event_data = _validate_event(event)

    # -----------------------------------------------------
    # IMPORTANT:
    #
    # DO NOT convert snapshot_path/crop_path to public URL
    # before saving.
    #
    # Database should keep:
    #
    # test/snapshot.jpg
    #
    # NOT:
    #
    # https://....supabase.co/...
    # -----------------------------------------------------

    saved_event = save_event(
        event_data
    )

    # -----------------------------------------------------
    # RESPONSE TO FRONTEND
    #
    # Frontend gets public URLs.
    # Database keeps original storage paths.
    # -----------------------------------------------------

    response_event = _public_evidence_urls(
        event_data
    )

    return {
        "status": "EVENT_RECEIVED",

        "message": (
            f"{event_data['event_type'].title()} "
            "event received and saved successfully"
        ),

        "data": response_event,

        "database": saved_event,
    }