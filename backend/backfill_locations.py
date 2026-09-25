from backend.supabase_client import supabase
from backend.geocoding import reverse_geocode


def backfill_locations():

    response = (
        supabase
        .table("events")
        .select("id, latitude, longitude, location_name")
        .not_.is_("latitude", "null")
        .not_.is_("longitude", "null")
        .execute()
    )

    events = response.data or []

    print(f"Found {len(events)} events with GPS coordinates.")

    updated = 0
    skipped = 0
    failed = 0

    for event in events:

        event_id = event["id"]
        latitude = event.get("latitude")
        longitude = event.get("longitude")

        # Already geocoded
        if event.get("location_name"):
            print(f"SKIP {event_id} - location already exists")
            skipped += 1
            continue

        print(
            f"Geocoding event {event_id}: "
            f"{latitude}, {longitude}"
        )

        location = reverse_geocode(
            latitude,
            longitude
        )

        if not location:
            print(f"FAILED {event_id}")
            failed += 1
            continue

        update_data = {
            "location_name": location.get("display_name"),
            "road_name": location.get("road"),
            "neighbourhood": location.get("neighbourhood"),
            "suburb": location.get("suburb"),
            "city": location.get("city"),
            "state": location.get("state"),
            "postcode": location.get("postcode"),
        }

        try:

            supabase \
                .table("events") \
                .update(update_data) \
                .eq("id", event_id) \
                .execute()

            print(
                f"UPDATED {event_id}: "
                f"{location.get('display_name')}"
            )

            updated += 1

        except Exception as error:

            print(
                f"UPDATE FAILED {event_id}: {error}"
            )

            failed += 1

    print("\n================================")
    print("BACKFILL COMPLETE")
    print("================================")
    print(f"Updated : {updated}")
    print(f"Skipped : {skipped}")
    print(f"Failed  : {failed}")


if __name__ == "__main__":
    backfill_locations()